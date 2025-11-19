/**
 * Integration test to verify Adobe provider with options works
 */
import { describe, it, expect } from 'vitest'
import { providers as unifontProviders } from 'unifont'

describe('Adobe provider configuration', () => {
  it('should initialize Adobe provider with options object', () => {
    const config = { id: ['test-id-1', 'test-id-2'] }
    
    // Simulate what the module does
    const provider = config as any
    const isConfigObject = provider && typeof provider === 'object' && !('_name' in provider) && typeof provider !== 'function'
    
    expect(isConfigObject).toBe(true)
    
    if (isConfigObject) {
      const adobeFactory = unifontProviders.adobe
      expect(typeof adobeFactory).toBe('function')
      
      const initializedProvider = adobeFactory(config)
      expect(initializedProvider).toBeDefined()
      expect(initializedProvider._name).toBe('adobe')
    }
  })

  it('should detect when provider is already initialized', () => {
    const initializedProvider = unifontProviders.adobe({ id: ['test'] })
    const hasName = '_name' in initializedProvider
    
    expect(hasName).toBe(true)
    expect(initializedProvider._name).toBe('adobe')
  })
})
