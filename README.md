# JavaScript-BlinkUp-SDK

Electric Imp’s BlinkUp™ technology provides a means to securely configure an imp-enabled device for local network access. Connectivity may be wireless or wired, depending on the type of imp integrated into the device. The network access credentials are transmitted to the device optically using the display of a mobile phone or tablet: they are encoded as screen flashes of various intensities.

BlinkUp can be supported in iOS- and Android-based mobile apps using native SDKs which Electric Imp makes freely available to its commercial partners. This is the recommended means of incorporating BlinkUp into customers’ mobile apps.

Electric Imp also provides a third BlinkUp SDK which uses JavaScript to deliver BlinkUp through a web browser. This is made available to customers to allow them to target mobile platforms which are not supported by Electric Imp through native SDKs. It also allows small developers who lack Android and/or iOS development experience to provide BlinkUp apps for low-volume device deployments as per the Electric Imp Developer Account terms and conditions.

This document describes how the Electric Imp JavaScript BlinkUp SDK can be used to deliver BlinkUp through a mobile browser. The term ‘mobile browser’ includes not only web browser apps but also web browser functionality integrated into native apps. Web browser apps will require the JavaScript and entry point HTML to be stored on a remote server as part of a web app. However, the use of a web browser view within a native app allows the code to be stored locally, inside the app itself.

## Limitations of the JavaScript BlinkUp SDK

We recommend that customers make use of the two native BlinkUp SDKs. These provide much greater control over the BlinkUp process than is possible through the web browser views which are used to deliver JavaScript BlinkUp. The JavaScript BlinkUp SDK has a number of other important limitation of which potential users need to be aware:

- The JavaScript BlinkUp SDK may not be compatible with all mobile browsers. At this time, Safari (WebKit) and Android Browser are compatible, but Chrome on Android is not. We will update this information as the SDK is tested with other browsers.

- Web apps can generally not control the mobile device’s screen brightness. As such, the end-user should be prompted to increase the brightness of their device’s display to prevent failed BlinkUps.

- Power saving features made available by mobile operating system and device providers may affect JavaScript BlinkUp performance, typically by auto-dimming the screen. Again, the end-user should be prompted to disable these features to prevent failed BlinkUps.

## Using the JavaScript BlinkUp SDK

We encourage all JavaScript BlinkUp users to file pull requests if they uncover issues with the current version. We regret that we cannot support user-modified versions of the JavaScript BlinkUp SDK and can only take feedback through pull requests.

## Using the JavaScript BlinkUp SDK

**Coming Soon**
