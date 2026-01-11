// MetaMask Integration Component
// NOTE: This is provided for reference - connecting to MetaMask is NOT part of the assessment task
// You may use this as a starting point if needed

import { useState, useEffect } from 'react'

const MetaMaskButton = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState(null)
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false)

  useEffect(() => {
    // Check if MetaMask is installed
    const checkMetaMask = () => {
      try {
        if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
          setIsMetaMaskAvailable(true)
          checkConnection()
        }
      } catch (error) {
        // Silently handle - MetaMask not available
        setIsMetaMaskAvailable(false)
      }
    }

    checkMetaMask()
    
    // Listen for MetaMask installation
    if (typeof window !== 'undefined') {
      window.addEventListener('ethereum#initialized', checkMetaMask, { once: true })
      return () => {
        window.removeEventListener('ethereum#initialized', checkMetaMask)
      }
    }
  }, [])

  const checkConnection = async () => {
    try {
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts && accounts.length > 0) {
          setIsConnected(true)
          setAccount(accounts[0])
        }
      }
    } catch (error) {
      // Silently handle - user may not be connected
      setIsConnected(false)
      setAccount(null)
    }
  }

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        if (accounts && accounts.length > 0) {
          setIsConnected(true)
          setAccount(accounts[0])
        }
      } else {
        // MetaMask not installed
        const url = 'https://metamask.io/download/'
        if (window.confirm('MetaMask is not installed. Would you like to install it?')) {
          window.open(url, '_blank')
        }
      }
    } catch (error) {
      // User rejected the request or other error
      if (error.code !== 4001) {
        console.error('Error connecting to MetaMask:', error)
      }
    }
  }

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Don't show button if MetaMask is definitely not available (after initial check)
  // But allow it to be shown if we haven't checked yet or if it's available
  if (!isMetaMaskAvailable && typeof window !== 'undefined' && typeof window.ethereum === 'undefined') {
    // MetaMask is not available - optionally hide or show disabled state
    // For assessment purposes, we'll still show it but handle gracefully
  }

  return (
    <button
      onClick={connectWallet}
      disabled={!isMetaMaskAvailable && typeof window !== 'undefined' && typeof window.ethereum === 'undefined'}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isConnected
          ? 'bg-green-100 text-green-800 border border-green-300'
          : isMetaMaskAvailable || (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined')
          ? 'bg-pulse-primary text-white hover:bg-pulse-secondary'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
      title={!isMetaMaskAvailable && typeof window !== 'undefined' && typeof window.ethereum === 'undefined' ? 'MetaMask not installed' : ''}
    >
      {isConnected ? (
        <span>🦊 {formatAddress(account)}</span>
      ) : (
        <span>Connect MetaMask</span>
      )}
    </button>
  )
}

export default MetaMaskButton
