import { defineConfig } from '@playwright/test';
import chromium from '@sparticuz/chromium';

// Lambda Chromium ships AL2023 NSS libraries. Local CI can use its normal browser instead.
const localLibs='/tmp/browser-libs/lib';
if(!process.env.CI) process.env.LD_LIBRARY_PATH=`${localLibs}:${process.env.LD_LIBRARY_PATH??''}`;
export default defineConfig({
 testDir:'e2e', timeout:30000, fullyParallel:false, workers:1,
 use:{baseURL:'http://127.0.0.1:5173',headless:true,launchOptions:{executablePath:process.env.CI?undefined:await chromium.executablePath(),args:process.env.CI?[]:chromium.args.filter(arg=>arg!=='--single-process'),env:{...process.env}},trace:'retain-on-failure',screenshot:'only-on-failure'},
 webServer:{env:{VITE_SUPABASE_URL:'https://test.supabase.co',VITE_SUPABASE_ANON_KEY:'test-public-key'},command:'npm run dev -- --force',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI,timeout:60000},
 reporter:'list',outputDir:'/tmp/athletix-playwright-results',
});
