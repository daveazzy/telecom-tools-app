import { useState, useEffect, useCallback } from 'react'

export interface GeolocationData {
  latitude: number | null
  longitude: number | null
  altitude: number | null
  accuracy: number | null
  timestamp: number | null
}

export interface GeolocationError {
  code: number
  message: string
}

export interface UseGeolocationResult {
  location: GeolocationData
  error: GeolocationError | null
  loading: boolean
  getCurrentPosition: () => void
  watchPosition: () => void
  clearWatch: () => void
  isSupported: boolean
}

export const useGeolocation = (): UseGeolocationResult => {
  const [location, setLocation] = useState<GeolocationData>({
    latitude: null,
    longitude: null,
    altitude: null,
    accuracy: null,
    timestamp: null,
  })
  const [error, setError] = useState<GeolocationError | null>(null)
  const [loading, setLoading] = useState(false)
  const [watchId, setWatchId] = useState<number | null>(null)

  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    })
    setError(null)
    setLoading(false)
  }, [])

  const handleError = useCallback((err: GeolocationPositionError) => {
    setError({
      code: err.code,
      message: err.message,
    })
    setLoading(false)
  }, [])

  const getCurrentPosition = useCallback(() => {
    if (!isSupported) {
      setError({
        code: 0,
        message: 'Geolocalização não suportada pelo navegador',
      })
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [isSupported, handleSuccess, handleError])

  const watchPosition = useCallback(() => {
    if (!isSupported) {
      setError({
        code: 0,
        message: 'Geolocalização não suportada pelo navegador',
      })
      return
    }

    setLoading(true)
    setError(null)

    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )

    setWatchId(id)
  }, [isSupported, handleSuccess, handleError])

  const clearWatch = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
  }, [watchId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  return {
    location,
    error,
    loading,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    isSupported,
  }
}
