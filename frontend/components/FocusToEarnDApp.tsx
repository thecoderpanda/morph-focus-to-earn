import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ethers } from 'ethers'
import { ClockIcon, WalletIcon, CoinsIcon, Loader2 } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

declare global {
  interface Window {
    ethereum?: any;
  }
}

const contractABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_usdtToken",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_ftnToken",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "AlreadyDeposited",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "claimRewards",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "DepositRequired",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NoRewardsToClaim",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "TimerAlreadyStarted",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "TimerNotStarted",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Deposit",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "RewardsClaimed",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "startTimer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "stopTimer",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "startTime",
				"type": "uint256"
			}
		],
		"name": "TimerStarted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "focusTime",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "rewards",
				"type": "uint256"
			}
		],
		"name": "TimerStopped",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "DEPOSIT_AMOUNT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "FTN_DECIMALS",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ftnToken",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContractFTNBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getUserInfo",
		"outputs": [
			{
				"internalType": "bool",
				"name": "hasDeposited",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "totalFocusTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "accumulatedRewards",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isTiming",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "REWARD_RATE_PER_SECOND",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalRewardsClaimed",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "USDT_DECIMALS",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "usdtToken",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userInfo",
		"outputs": [
			{
				"internalType": "bool",
				"name": "hasDeposited",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "totalFocusTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "accumulatedRewards",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastStartTime",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isTiming",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

const contractAddress = '0xa525EDf168BB9E9853513a53B328bca2D14295CF'
const usdtAddress = '0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98'

const morphl2Config = {
  chainId: '0x1f47', // 8007 in decimal
  chainName: 'Morphl2 Testnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://rpc-quicknode-holesky.morphl2.io'],
  blockExplorerUrls: ['https://explorer.morphl2.io']
}

export default function Component() {
  const [walletAddress, setWalletAddress] = useState('')
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [focusTime, setFocusTime] = useState(0)
  const [rewards, setRewards] = useState('0')
  const [totalRewardsClaimed, setTotalRewardsClaimed] = useState('0')
  const [hasDeposited, setHasDeposited] = useState(false)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [usdtContract, setUsdtContract] = useState<ethers.Contract | null>(null)
  const [isApproved, setIsApproved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRewardLoading, setIsRewardLoading] = useState(false)
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setFocusTime(prevTime => prevTime + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  useEffect(() => {
    if (contract && walletAddress) {
      updateUserInfo()
      updateTotalRewardsClaimed()
    }
  }, [contract, walletAddress])

  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsLoading(true)
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(web3Provider)
        const signer = web3Provider.getSigner()
        const address = await signer.getAddress()
        setWalletAddress(address)

        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer)
        setContract(contractInstance)

        const usdtABI = [
          "function approve(address spender, uint256 amount) external returns (bool)",
          "function allowance(address owner, address spender) external view returns (uint256)",
          "function transfer(address recipient, uint256 amount) external returns (bool)"
        ]
        const usdtInstance = new ethers.Contract(usdtAddress, usdtABI, signer)
        setUsdtContract(usdtInstance)

        await checkAllowance()
      } catch (error) {
        console.error("Failed to connect wallet:", error)
        toast.error("Failed to connect wallet. Please try again.")
      } finally {
        setIsLoading(false)
      }
    } else {
      console.error("Metamask is not installed")
      toast.error("Please install MetaMask to use this DApp.")
    }
  }

  const checkAllowance = async () => {
    if (usdtContract && walletAddress) {
      try {
        const allowance = await usdtContract.allowance(walletAddress, contractAddress)
        setIsApproved(allowance.gte(ethers.utils.parseUnits("0.2", 18))) // Updated to 18 decimals
      } catch (error) {
        console.error("Failed to check allowance:", error)
        toast.error("Failed to check USDT allowance.")
      }
    }
  }

  const updateUserInfo = async () => {
    if (contract && walletAddress) {
      try {
        setIsLoading(true)
        const userInfo = await contract.getUserInfo(walletAddress)
        setHasDeposited(userInfo.hasDeposited)
        setFocusTime(userInfo.totalFocusTime.toNumber())
        setRewards(ethers.utils.formatEther(userInfo.accumulatedRewards))
        setIsTimerRunning(userInfo.isTiming)
      } catch (error) {
        console.error("Failed to update user info:", error)
        toast.error("Failed to fetch user info. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const updateTotalRewardsClaimed = async () => {
    if (contract) {
      try {
        setIsLoading(true)
        const total = await contract.totalRewardsClaimed()
        setTotalRewardsClaimed(ethers.utils.formatEther(total))
      } catch (error) {
        console.error("Failed to update total rewards claimed:", error)
        toast.error("Failed to fetch total rewards claimed.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleApprove = async () => {
    if (usdtContract) {
      try {
        setIsLoading(true)
        const approveTx = await usdtContract.approve(contractAddress, ethers.utils.parseUnits("0.2", 18)) // Updated to 18 decimals
        await approveTx.wait()
        setIsApproved(true)
        toast.success("USDT approval successful!")
      } catch (error) {
        console.error("Failed to approve USDT:", error)
        toast.error("Failed to approve USDT. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDeposit = async () => {
    if (contract && provider) {
      try {
        setIsLoading(true)
        const tx = await contract.deposit({ gasLimit: 300000 })
        await tx.wait()
        setHasDeposited(true)
        toast.success("Deposit successful!")
        await updateUserInfo()
      } catch (error) {
        console.error("Failed to deposit:", error)
        toast.error("Failed to deposit. Please check your balance and try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleStartTimer = async () => {
    if (contract && provider) {
      try {
        setIsLoading(true)
        const tx = await contract.startTimer({ gasLimit: 200000 })
        await tx.wait()
        setIsTimerRunning(true)
        toast.success("Timer started successfully!")
        await updateUserInfo()
      } catch (error) {
        console.error("Failed to start timer:", error)
        toast.error("Failed to start timer. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleStopTimer = async () => {
    if (contract && provider) {
      try {
        setIsLoading(true)
        const tx = await contract.stopTimer({ gasLimit: 200000 })
        await tx.wait()
        setIsTimerRunning(false)
        toast.success("Timer stopped successfully!")
        await updateUserInfo()
      } catch (error) {
        console.error("Failed to stop timer:", error)
        toast.error("Failed to stop timer. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleClaimRewards = async () => {
    if (contract && provider) {
      try {
        setIsRewardLoading(true)
        const tx = await contract.claimRewards({ gasLimit: 300000 })
        await tx.wait()
        toast.success("Rewards claimed successfully!")
        await updateUserInfo()
        await updateTotalRewardsClaimed()
      } catch (error) {
        console.error("Failed to claim rewards:", error)
        toast.error("Failed to claim rewards. Please try again.")
      } finally {
        setIsRewardLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-pink-500 text-white">
      <Toaster position="top-right" />
      <header className="p-4 bg-black bg-opacity-30 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Focus to Earn</h1>
        {walletAddress ? (
          <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-4 py-2">
            <WalletIcon className="h-5 w-5" />
            <span className="text-sm">{`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</span>
          </div>
        ) : (
          <Button onClick={handleConnectWallet} className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-none" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WalletIcon className="mr-2 h-4 w-4" />}
            Connect Wallet
          </Button>
        )}
      </header>
      <main className="container mx-auto mt-8 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-white bg-opacity-10 backdrop-blur-lg border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold">Focus Timer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <div className="text-6xl font-bold tabular-nums bg-white bg-opacity-20 rounded-lg p-4">
                {`${Math.floor(focusTime / 3600).toString().padStart(2, '0')}:${Math.floor((focusTime % 3600) / 60).toString().padStart(2, '0')}:${(focusTime % 60).toString().padStart(2, '0')}`}
              </div>
              {!hasDeposited ? (
                isApproved ? (
                  <Button 
                    onClick={handleDeposit} 
                    disabled={isLoading}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105"
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? 'Depositing...' : 'Deposit 0.2 USDT'}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleApprove} 
                    disabled={isLoading}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105"
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? 'Approving...' : 'Approve USDT'}
                  </Button>
                )
              ) : isTimerRunning ? (
                <Button 
                  onClick={handleStopTimer} 
                  disabled={isLoading}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isLoading ? 'Stopping...' : 'Stop Timer'}
                </Button>
              ) : (
                <Button 
                  onClick={handleStartTimer} 
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isLoading ? 'Starting...' : 'Start Timer'}
                </Button>
              )}
            </CardContent>
          </Card>
          <Card className="bg-white bg-opacity-10 backdrop-blur-lg border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold">Rewards</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <div className="text-4xl font-bold bg-white bg-opacity-20 rounded-lg p-4">
                {parseFloat(rewards).toFixed(2)} FTN
              </div>
              <Button 
                onClick={handleClaimRewards} 
                disabled={parseFloat(rewards) === 0 || isRewardLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                {isRewardLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isRewardLoading ? 'Claiming...' : 'Claim Rewards'}
              </Button>
              <div className="text-sm bg-white bg-opacity-20 rounded-full px-4 py-2">
                Total Claimed: {parseFloat(totalRewardsClaimed).toFixed(2)} FTN
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}