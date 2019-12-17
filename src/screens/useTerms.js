import React, { useEffect } from 'react';

import { createStyle } from '../flcss.js';

const TermsAndConditions = () =>
{
  // on url change reset scroll position
  useEffect(() =>
  {
    document.title = 'Terms and Conditions';

    window.scrollTo(0, 0);
  }, [ window.location ]);

  return (
    <div className={ styles.container }>
      <h2><strong>Terms and Conditions</strong></h2>

      <p>Welcome to Kuruit Bedan Fash5.</p>

      <p>These terms and conditions outline the rules and regulations for the use of this Herp Project{'\''}s Web App, located at https://bedan.me</p>

      <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use Kuruit Bedan Fash5 if you do not agree to take all of the terms and conditions stated on this page.</p>

      <p>{'The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this website and compliant to the Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves. All terms refer to the offer, acceptance and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner for the express purpose of meeting the Client’s needs in respect of provision of the Company’s stated services, in accordance with and subject to, prevailing law of Netherlands. Any use of the above terminology or other words in the singular, plural, capitalization and/or he/she or they, are taken as interchangeable and therefore as referring to same.'}</p>

      <h3><strong>Cookies</strong></h3>

      <p>We employ the use of cookies. By accessing Kuruit Bedan Fash5, you agreed to use cookies in agreement with the Herp Project{'\''}s Privacy Policy.</p>

      <p>Most interactive websites use cookies to retrieve the user’s details for each visit. Cookies are used by our website to enable the functionality of certain areas to make it easier for people visiting our website. Some of our affiliate/advertising partners may also use cookies.</p>

      <h3><strong>Legal</strong></h3>

      <p>We urge the people not use the {'\''}Kuruit Bedan Fash5{'\''} name, Out of fear that it might cause confusion and misinformation, However we don{'\''}t own the {'\''}Kuruit Bedan Fash5{'\''} name</p>

      <p>If you are the user, don{'\''}t trust anything published under the {'\''}Kuruit Bedan Fash5{'\''} name unless it{'\''}s published from Herp Project owned domains</p>

      <p>Kuruit Bedan Fash5 is a fill-in-the-blank party game where all the cards are made by the community, the community submit card ideas and vote on them, the most popular cards are then added to the game occasionally.</p>

      <p>Nor Herp Project nor any of its employees can be held responsible for any offensive, racist, sexist or inappropriate community-created cards.</p>

      <p>Herp Project doesn{'\''}t filter or edit any community-created cards, no matter what they contain.</p>

      <p>{'Freedom of expression is recognized as a human right under article 19 of the Universal Declaration of Human Rights (UDHR) and recognized in international human rights law in the International Covenant on Civil and Political Rights (ICCPR). Article 19 of the UDHR states that "everyone shall have the right to hold opinions without interference" and "everyone shall have the right to freedom of expression; this right shall include freedom to seek, receive and impart information and ideas of all kinds, regardless of frontiers, either orally, in writing or in print, in the form of art, or through any other media of his choice".'}</p>

      <p>However, If a card is offending to a person or an organization, and Herp Project receives a complaint directly from said the person/organization, Herp Project will remove the card (s) from the game.</p>

      <p>Herp Project does hold the popular community voted cards for review to see if they fit the gameplay rules, not similar to any other already added cards and are correctly spelled, before adding them to the game.</p>

      <p>Herp Project don{'\''}t collect the names of the card creators, this is to protect their privacy and rights.</p>

      <h2>Children</h2>

      <p>Another part of our priority is protecting children while using the internet. We encourage parents and guardians to observe, and not allow their kids to visit this website.</p>

      <p>Kuruit Bedan Fash5 is not a kid-friendly website, no children under the age of 13 should be allow to visit it.</p>

      <h3><strong>Hyperlinking to our Content</strong></h3>

      <p>The following organizations may link to our Website without prior written approval:</p>

      <ul>
        <li>Search engines;</li>
        <li>News organizations;</li>
        <li>Online directory distributors may link to our Website in the same manner as they hyperlink to the Websites of other listed businesses; and</li>
        <li>System wide Accredited Businesses except soliciting non-profit organizations, charity shopping malls, and charity fundraising groups which may not hyperlink to our Web site.</li>
      </ul>

      <p>These organizations may link to our home page, to publications or to other Website information so long as the link: (a) is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement or approval of the linking party and its products and/or services; and (c) fits within the context of the linking party’s site.</p>

      <p>We may consider and approve other link requests from the following types of organizations:</p>

      <ul>
        <li>commonly-known consumer and/or business information sources;</li>
        <li>dot.com community sites;</li>
        <li>associations or other groups representing charities;</li>
        <li>online directory distributors;</li>
        <li>internet portals;</li>
        <li>accounting, law and consulting firms; and</li>
        <li>educational institutions and trade associations.</li>
      </ul>

      <p>We will approve link requests from these organizations if we decide that: (a) the link would not make us look unfavorably to ourselves or to our accredited businesses; (b) the organization does not have any negative records with us; (c) the benefit to us from the visibility of the hyperlink compensates the absence of Herp Project; and (d) the link is in the context of general resource information.</p>

      <p>These organizations may link to our home page so long as the link: (a) is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement or approval of the linking party and its products or services; and (c) fits within the context of the linking party’s site.</p>

      <p>If you are one of the organizations listed in paragraph 2 above and are interested in linking to our website, you must inform us by sending an e-mail to Herp Project. Please include your name, your organization name, contact information as well as the URL of your site, a list of any URLs from which you intend to link to our Website, and a list of the URLs on our site to which you would like to link. Wait 2-3 weeks for a response.</p>

      <p>Approved organizations may hyperlink to our Website as follows:</p>

      <ul>
        <li>By use of our corporate name; or</li>
        <li>By use of the uniform resource locator being linked to; or</li>
        <li>By use of any other description of our Website being linked to that makes sense within the context and format of content on the linking party’s site.</li>
      </ul>

      <p>No use of Herp Project{'\''}s logo or other artwork will be allowed for linking absent a trademark license agreement.</p>

      <h3><strong>iFrames</strong></h3>

      <p>Without prior approval and written permission, you may not create frames around our Webpages that alter in any way the visual presentation or appearance of our Website.</p>

      <h3><strong>Content Liability</strong></h3>

      <p>We shall not be hold responsible for any content that appears on your Website. You agree to protect and defend us against all claims that is rising on your Website. No link(s) should appear on any Website that may be interpreted as libelous, obscene or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.</p>

      <h3><strong>Your Privacy</strong></h3>

      <p>Please read Privacy Policy</p>

      <h3><strong>Reservation of Rights</strong></h3>

      <p>We reserve the right to request that you remove all links or any particular link to our Website. You approve to immediately remove all links to our Website upon request. We also reserve the right to amen these terms and conditions and it’s linking policy at any time. By continuously linking to our Website, you agree to be bound to and follow these linking terms and conditions.</p>

      <h3><strong>Removal of links from our website</strong></h3>

      <p>If you find any link on our Website that is offensive for any reason, you are free to contact and inform us any moment. We will consider requests to remove links but we are not obligated to or so or to respond to you directly.</p>

      <p>We do not ensure that the information on this website is correct, we do not warrant its completeness or accuracy; nor do we promise to ensure that the website remains available or that the material on the website is kept up to date.</p>

      <h3><strong>Disclaimer</strong></h3>

      <p>To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:</p>

      <ul>
        <li>limit or exclude our or your liability for death or personal injury;</li>
        <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
        <li>limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
        <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
      </ul>

      <p>The limitations and prohibitions of liability set in this Section and elsewhere in this disclaimer: (a) are subject to the preceding paragraph; and (b) govern all liabilities arising under the disclaimer, including liabilities arising in contract, in tort and for breach of statutory duty.</p>

      <p>As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.</p>
    </div>
  );
};

const styles = createStyle({
  container: {
    fontFamily: '"Montserrat", sans-serif',

    padding: '5vh 5vw'
  }
});

export default TermsAndConditions;