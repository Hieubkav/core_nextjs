import React from 'react'
import SignInClient from './SignInClient'

export default function Page() {
  return (
    <React.Suspense fallback={null}>
      <SignInClient />
    </React.Suspense>
  )
}

