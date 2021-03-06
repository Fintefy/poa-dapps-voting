import Web3 from 'web3'
import { messages } from './messages'
import { constants } from './constants'
import { netIdByName } from './helpers'

let getWeb3 = () => {
  return new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load', async () => {
      let web3 = null

      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      if (window.ethereum) {
        web3 = new Web3(window.ethereum)
        console.log('Injected web3 detected.')
        try {
          await window.ethereum.enable()
        } catch (e) {
          console.error('User denied account access')
          reject({ message: messages.USER_DENIED_ACCOUNT_ACCESS })
          return
        }
      } else if (typeof window.web3 !== 'undefined') {
        web3 = new Web3(window.web3.currentProvider)
        console.log('Injected web3 detected.')
      }

      let errorMsg = null
      let netIdName
      let netId
      let defaultAccount = null

      if (web3) {
        netId = await web3.eth.net.getId()
        console.log('netId', netId)

        if (!(netId in constants.NETWORKS)) {
          netIdName = 'ERROR'
          errorMsg = messages.WRONG_NETWORK_MSG
          console.log('This is an unknown network.')
        } else {
          netIdName = constants.NETWORKS[netId].NAME
          console.log(`This is ${netIdName}`)
        }

        const accounts = await web3.eth.getAccounts()

        defaultAccount = accounts[0] || null
      } else {
        // Fallback to local if no web3 injection.

        console.log('No web3 instance injected, using Local web3.')
        console.error('Metamask not found')

        netId = netIdByName(constants.CORE)

        const network = constants.NETWORKS[netId]

        web3 = new Web3(new Web3.providers.HttpProvider(network.RPC))
        netIdName = network.NAME
      }

      document.title = `${netIdName} - POA Network Governance DApp`

      if (errorMsg !== null) {
        reject({ message: errorMsg })
        return
      }

      resolve({
        web3Instance: web3,
        netIdName,
        netId,
        defaultAccount: '0xCf260eA317555637C55F70e55dbA8D5ad8414Cb0'
      })
    })
  })
}

export default getWeb3
