// background: no external network calls; used for version ping + storage
chrome.runtime.onInstalled.addListener(()=>console.log('RoutePilot installed'));
