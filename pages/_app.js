import React from 'react'
import App from 'next/app'
import Head from 'next/head'
import Router from 'next/router'
// import { init as initApm } from 'elastic-apm-js-base'
import { Normalize } from '@smooth-ui/core-sc'
import Navbar from '../components/Navbar'
import { StoreProvider } from '../services/StoreContext'
import { getAccessToken } from '../services/storage'

export default class MyDataCV extends App {
  async componentDidMount () {
    /* const apm = initApm({

      // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
      serviceName: 'mydata-cv',

      // Set custom APM Server URL (default: http://localhost:8200)
      serverUrl: 'http://localhost:8200',

      // Set service version (required for sourcemap feature)
      serviceVersion: ''
    })
    apm.setInitialPageLoadName(window.location.href)
    */

    const token = getAccessToken()
    if (token) {
      if (Router.pathname === '/') {
        Router.push({
          pathname: '/profile'
        })
      }
    } else {
      if (Router.pathname === '/profile') {
        Router.push({
          pathname: '/'
        })
      }
    }
  }

  render () {
    const { Component, pageProps } = this.props

    return (
      <>
        <Normalize />
        <Head>
          <title>CV</title>
        </Head>
        <StoreProvider>
          <Navbar />
          <Component {...pageProps} />
        </StoreProvider>
      </>
    )
  }
}
