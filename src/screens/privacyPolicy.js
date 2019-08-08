import React, { useEffect } from 'react';

import { createStyle } from '../flcss.js';

const PrivacyPolicy = () =>
{
  // on url change reset scroll position
  useEffect(() =>
  {
    document.title = 'Privacy Policy';
    
    window.scrollTo(0, 0);
  }, [ window.location ]);
  
  return (
    <div className={styles.container}>
      <h1><strong>Privacy Policy</strong></h1>

      <p>At Kuruit Bedan Fash5, accessible from https://kbf.herpproject.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Kuruit Bedan Fash5 and how we use it.</p>

      <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us through email at hello@herpproject.com</p>

      <h2>Cookies and Web Beacons</h2>

      <p>{'Like any other website, Kuruit Bedan Fash5 uses \'cookies\'. These cookies are used to store information including visitors\' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users\' experience by customizing our web page content based on visitors\' browser type and/or other information.'}</p>

      <p>You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the {'browsers\''} respective websites. What Are Cookies?</p>

      <h2>Privacy Policies</h2>

      <p>Kuruit Bedan Fash5 does not knowingly use any third-party ad servers on this website.</p>

      <p>Kuruit Bedan Fash5 does collect data from the users, however this data is collected anonymously, the data we collect contains but are not limited to:</p><p/>

      <ul>
        <li>the most used card packages.</li>
        <li>the most played cards in-game.</li>
        <li>the most popular card combinations.</li>
      </ul>

      <h2>{'Children\'s Information'}</h2>

      <p>Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.</p>

      <p>Kuruit Bedan Fash5 does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.</p>

      <h2>Online Privacy Policy Only</h2>

      <p>This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in Kuruit Bedan Fash5. This policy is not applicable to any information collected offline or via channels other than this website.</p>

      <h2>Consent</h2>

      <p>By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.</p>
    </div>
  );
};

const styles = createStyle({
  container: {
    fontFamily: '"Montserrat", sans-serif',

    padding: '5vh 5vw'
  }
});

export default PrivacyPolicy;