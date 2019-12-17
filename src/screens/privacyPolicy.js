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
    <div className={ styles.container }>
      <h1><strong>Privacy Policy</strong></h1>

      <p>At Kuruit Bedan Fash5, accessible from https://bedan.me, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Kuruit Bedan Fash5 and how we use it.</p>

      <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us through email at hello@herpproject.com</p>

      <h2>Google DoubleClick DART Cookie</h2>

      <p>Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads">https://policies.google.com/technologies/ads</a></p>

      <h2>Privacy Policies</h2>

      <p>You may consult this list to find the Privacy Policy for each of the advertising partners of Kuruit Bedan Fash5.</p>

      <p>Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Kuruit Bedan Fash5, which are sent directly to users{'\''} browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.</p>

      <p>Note that Kuruit Bedan Fash5/Herp Project has no access to or control over these cookies that are used by third-party advertisers.</p>

      <p>Kuruit Bedan Fash5 does collect data from users, however, the data we collect is collected anonymously, it contains but are not limited to:</p><p/>

      <ul>
        <li>the most used card packages.</li>
        <li>the most played cards in-game.</li>
        <li>the most popular card combinations.</li>
      </ul>

      <h2>Third Party Privacy Policies</h2>

      <p>Kuruit Bedan Fash5{'\''}s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options. You may find a complete list of these Privacy Policies and their links here: Privacy Policy Links.</p>

      <p>You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers{'\''} respective websites. What Are Cookies?</p>

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