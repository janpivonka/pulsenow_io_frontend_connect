import { useState, useEffect } from 'react'

const MetaMaskButton = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState(null)
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false)

  useEffect(() => {
    const checkMetaMask = () => {
      try {
        if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && window.ethereum.isMask) {
          setIsMetaMaskAvailable(true)
          checkConnection()
        }
      } catch (error) {
        setIsMetaMaskAvailable(false)
      }
    }
    checkMetaMask()
    if (typeof window !== 'undefined') {
      window.addEventListener('ethereum#initialized', checkMetaMask, { once: true })
      return () => window.removeEventListener('ethereum#initialized', checkMetaMask)
    }
  }, [])

  const checkConnection = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts && accounts.length > 0) {
          setIsConnected(true)
          setAccount(accounts[0])
        }
      }
    } catch (error) {
      setIsConnected(false)
      setAccount(null)
    }
  }

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts && accounts.length > 0) {
          setIsConnected(true)
          setAccount(accounts[0])
        }
      } else {
        window.open('https://metamask.io/download/', '_blank')
      }
    } catch (error) {
      if (error.code !== 4001) console.error(error)
    }
  }

  const formatAddress = (addr) => {
    if (!addr) return ''
    // Na mobilu ukážeme jen 2+2 znaky, na desktopu 6+4
    const start = window.innerWidth < 640 ? 2 : 6
    const end = window.innerWidth < 640 ? 2 : 4
    return `${addr.slice(0, start)}...${addr.slice(-end)}`
  }

  return (
    <button
      onClick={connectWallet}
      className={`
        shrink-0 transition-all duration-200 font-black uppercase tracking-widest text-[10px] md:text-xs
        flex items-center justify-center gap-2
        px-3 py-2 md:px-5 md:py-3 rounded-xl md:rounded-2xl
        ${isConnected
          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100 dark:border-emerald-800'
          : 'bg-slate-900 dark:bg-blue-600 text-white shadow-lg shadow-blue-500/10 hover:scale-[1.02] active:scale-95'
        }
      `}
    >
      <span className="text-sm md:text-base">🦊</span>
      
      {isConnected ? (
        <span className="font-mono">{formatAddress(account)}</span>
      ) : (
        <>
          {/* Na mobilu jen "Connect", na desktopu "Connect MetaMask" */}
          <span className="hidden sm:inline">Connect MetaMask</span>
          <span className="sm:hidden text-[9px]">Connect</span>
        </>
      )}
    </button>
  )
}

export default MetaMaskButton