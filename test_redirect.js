#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testAuthRedirect() {
  let browser;
  try {
    console.log('Starting browser...');
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Listen to console logs
    page.on('console', msg => console.log('[Browser Console]', msg.text()));
    page.on('response', response => {
      if (response.url().includes('localhost:5176')) {
        console.log('[Browser Response]', response.status(), response.url());
      }
    });
    
    // Clear localStorage first
    await page.evaluateOnNewDocument(() => {
      localStorage.clear();
    });
    
    console.log('Navigating to root URL...');
    await page.goto('http://localhost:5176/', { waitUntil: 'networkidle2' });
    
    // Wait a bit for React to initialize
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log('Final URL:', currentUrl);
    
    if (currentUrl.includes('/login')) {
      console.log('✅ SUCCESS: App correctly redirected to login page');
    } else if (currentUrl.includes('/dashboard')) {
      console.log('❌ FAILURE: App incorrectly redirected to dashboard');
    } else {
      console.log('⚠️  WARNING: App redirected to unexpected URL:', currentUrl);
    }
    
    // Check if login form exists
    const loginForm = await page.$('form');
    if (loginForm) {
      console.log('✅ Login form found on page');
    } else {
      console.log('❌ Login form not found on page');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testAuthRedirect();