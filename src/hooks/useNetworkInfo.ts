import { useState, useEffect } from 'react'

// Tipos da Network Information API
interface NetworkInformation extends EventTarget {
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
  downlink?: number // Mbps
  downlinkMax?: number // Mbps
  rtt?: number // ms
  saveData?: boolean
  onchange?: ((this: NetworkInformation, ev: Event) => any) | null
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation
  mozConnection?: NetworkInformation
  webkitConnection?: NetworkInformation
}

export interface NetworkInfoData {
  type: string | null
  effectiveType: string | null
  downlink: number | null
  rtt: number | null
  saveData: boolean
  isOnline: boolean
}

export interface UseNetworkInfoResult {
  networkInfo: NetworkInfoData
  isSupported: boolean
  refresh: () => void
}

export const useNetworkInfo = (): UseNetworkInfoResult => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfoData>({
    type: null,
    effectiveType: null,
    downlink: null,
    rtt: null,
    saveData: false,
    isOnline: navigator.onLine,
  })

  const getConnection = (): NetworkInformation | undefined => {
    const nav = navigator as NavigatorWithConnection
    return nav.connection || nav.mozConnection || nav.webkitConnection
  }

  const isSupported = typeof navigator !== 'undefined' && !!getConnection()

  const updateNetworkInfo = () => {
    const connection = getConnection()

    if (connection) {
      setNetworkInfo({
        type: connection.type || null,
        effectiveType: connection.effectiveType || null,
        downlink: connection.downlink || null,
        rtt: connection.rtt || null,
        saveData: connection.saveData || false,
        isOnline: navigator.onLine,
      })
    } else {
      setNetworkInfo((prev) => ({
        ...prev,
        isOnline: navigator.onLine,
      }))
    }
  }

  useEffect(() => {
    updateNetworkInfo()

    const connection = getConnection()

    // Listen for connection changes
    const handleChange = () => {
      updateNetworkInfo()
    }

    const handleOnline = () => {
      setNetworkInfo((prev) => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setNetworkInfo((prev) => ({ ...prev, isOnline: false }))
    }

    if (connection) {
      connection.addEventListener('change', handleChange)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      if (connection) {
        connection.removeEventListener('change', handleChange)
      }
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    networkInfo,
    isSupported,
    refresh: updateNetworkInfo,
  }
}

// Utility functions
export const getSignalTypeFromNetwork = (effectiveType: string | null, type: string | null): '4g' | '5g' | 'wifi' => {
  if (type === 'wifi') return 'wifi'
  if (effectiveType === '4g') return '4g'
  // 5G detection is limited in browsers, but we can make educated guess
  if (type === 'cellular' && effectiveType === '4g') {
    // Check if downlink is very high (>100 Mbps might indicate 5G)
    return '4g' // Default to 4g, user can override
  }
  return '4g' // Default
}

export const getTechnologyFromEffectiveType = (effectiveType: string | null): string => {
  switch (effectiveType) {
    case '4g':
      return 'LTE'
    case '3g':
      return '3G'
    case '2g':
    case 'slow-2g':
      return '2G/EDGE'
    default:
      return 'Unknown'
  }
}

export const estimateSignalQuality = (downlink: number | null, rtt: number | null): number | null => {
  if (!downlink && !rtt) return null

  let quality = 0

  // Based on downlink (0-50 points)
  if (downlink) {
    if (downlink >= 10) quality += 50
    else if (downlink >= 5) quality += 40
    else if (downlink >= 2) quality += 30
    else if (downlink >= 1) quality += 20
    else quality += 10
  }

  // Based on RTT (0-50 points)
  if (rtt) {
    if (rtt <= 50) quality += 50
    else if (rtt <= 100) quality += 40
    else if (rtt <= 150) quality += 30
    else if (rtt <= 200) quality += 20
    else quality += 10
  }

  return Math.min(quality, 100)
}
