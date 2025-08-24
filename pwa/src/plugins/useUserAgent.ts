import { onMounted, ref } from 'vue'

export function useUserAgent() {
  /**
   * we set our initial state as null because we don't know what the user agent is yet
   * that way we can check if the user agent has been set or not
   */
  const isMobile = ref<boolean | null>(null);
  const userAgent = ref<string | null>(null);
  const isIOS = ref<boolean | null>(null);
  const isStandalone = ref<boolean | null>(null);
  const userAgentString = ref<string | null>(null);

  if (window) {
    const userAgentStringValue = window.navigator.userAgent;
    userAgentString.value = userAgentStringValue;
    let userAgentValue;

    /**
     * Parse user agent string to determine browser
     * The order of the if statements is important because some browsers
     * have multiple matches in their user agent string
     */
    if (userAgentStringValue.indexOf('SamsungBrowser') > -1) {
      userAgentValue = 'SamsungBrowser';
    } else if (userAgentStringValue.indexOf('Firefox') > -1) {
      userAgentValue = 'Firefox';
    } else if (userAgentStringValue.indexOf('FxiOS') > -1) {
      userAgentValue = 'FirefoxiOS';
    } else if (userAgentStringValue.indexOf('CriOS') > -1) {
      userAgentValue = 'ChromeiOS';
    } else if (userAgentStringValue.indexOf('Chrome') > -1) {
      userAgentValue = 'Chrome';
    } else if (userAgentStringValue.indexOf('Safari') > -1) {
      userAgentValue = 'Safari';
    } else {
      userAgentValue = 'unknown';
    }
    userAgent.value = userAgentValue;

    // Check if user agent is mobile
    const isIOSValue = userAgentStringValue.match(/iPhone|iPad|iPod/i);
    const isAndroid = userAgentStringValue.match(/Android/i);
    isIOS.value = isIOSValue ? true : false;
    const isMobileValue = isIOSValue || isAndroid;
    isMobile.value = !!isMobileValue;

    // Check if app is installed (if it's installed we wont show the prompt)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isStandalone.value = true;
    }
  }

  return { isMobile, userAgent, isIOS, isStandalone, userAgentString }
}
