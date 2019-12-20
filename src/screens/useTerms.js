import React, { useEffect } from 'react';

import ReactMarkdown from 'react-markdown';

import { createStyle } from '../flcss.js';

const input = `
# Terms and Conditions

Welcome to Kuruit Bedan Fash5.

Herp Project ("us", "we", or "our") operates the https://bedan.me website (hereinafter referred to as the "Service").

The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this Service and compliant to the Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to Herp Project. "Party", "Parties", or "Us", refers to both the Client and ourselves. All terms refer to the offer, acceptance and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner for the express purpose of meeting the Client’s needs in respect of provision of the Company’s stated services, in accordance with and subject to, prevailing law of Netherlands. Any use of the above terminology or other words in the singular, plural, capitalization and/or he/she or they, are taken as interchangeable and therefore as referring to same.

These terms and conditions outline the rules and regulations for the use of this Service.

By accessing this Service we assume you accept these terms and conditions. Do not continue to use this Service if you do not agree to take all of the terms and conditions stated on this page.

### Cookies

We employ the use of cookies. By accessing this Service, you agreed to use cookies in agreement with this Service's Privacy Policy.

Most interactive websites use cookies to retrieve the user’s details for each visit. Cookies are used by this Service to enable the functionality of certain areas to make it easier for people visiting this Service. Some of our affiliate/advertising partners may also use cookies.

### Legal

We urge the people not use the "Kuruit Bedan Fash5" name/brand, Out of fear that it might cause confusion and misinformation, However, We don't legally own the "Kuruit Bedan Fash5" name/brand.

Do not trust anything published under the "Kuruit Bedan Fash5" name/brand unless it's published from a The Company's owned domains.

This Service is a fill-in-the-blank party game where all the cards are made by the community, the community submit card ideas and vote on them, and the most popular cards are then added to the game occasionally.

Nor The Company nor any of its employees can be held responsible for creating any offensive, racist, sexist or inappropriate cards.

The Company doesn't filter or edit any cards, no matter what they contain.

Freedom of expression is recognized as a human right under article 19 of the Universal Declaration of Human Rights (UDHR) and recognized in international human rights law in the International Covenant on Civil and Political Rights (ICCPR). Article 19 of the UDHR states that "everyone shall have the right to hold opinions without interference" and "everyone shall have the right to freedom of expression; this right shall include freedom to seek, receive and impart information and ideas of all kinds, regardless of frontiers, either orally, in writing or in print, in the form of art, or through any other media of his choice".

However, If a card is found offending to a person or an organization, and we receives a complaint directly from said the person/organization, We will remove the card(s) from our Service.

The Company does hold the voted cards for review but only to see if they fit the gameplay rules, and are not similar to any other already added cards, and are correctly spelled.

The Company does not collect the names of the card creators, this is to protect their privacy, rights and freedom.

### Children

One of our priorities is protecting children while using the internet. We encourage parents and guardians to observe, and not allow their kids to use this Service.

This Service is NOT kid-friendly, no children under the age of 18 should be allowed to use it.

### Hyperlinking to our Content

The following organizations may link to our Service without prior written approval

  * Search engines
  * Online directory distributors may link to this Service in the same manner as they hyperlink to the Websites of other listed businesses
  * System Wide Accredited Businesses except soliciting non-profit organizations, charity shopping malls, and charity fundraising groups which may not hyperlink to this Service
  
These organizations may link to this Service's Homepage, to publications or to other Service information so long as the link:
  
  * Is not in any way deceptive.
  * Does not falsely imply sponsorship, endorsement or approval of the linking party and its products and/or services.
  * Fits within the context of the linking party’s site.
  
We may consider and approve other link requests from the following types of organizations:
  
  * News organizations
  * Commonly-known consumer and/or business information sources.
  * Dot.com community sites.
  * Associations or other groups representing charities.
  * Online directory distributors.
  * Internet portals.
  * Accounting, law and consulting firms.
  * Educational institutions and trade associations.

We'll approve link requests from these organizations if we decide that:
  * The link would not make us look unfavorably to ourselves or to our accredited businesses.
  * The organization does not have any negative records with us.
  * The benefit to us from the visibility of the hyperlink compensates the absence of The Company.
  * The link is in the context of general resource information.

These organizations may link to this Service's Homepage, to publications or to other Service information so long as the link:
  
  * Is not in any way deceptive.
  * Does not falsely imply sponsorship, endorsement or approval of the linking party and its products and/or services.
  * Fits within the context of the linking party’s site.
  
If you are one of the organizations listed in paragraph 2 above and are interested in linking to this Service, you must inform us by sending an Email to us. Please include your name, your organization name, contact information as well as the URL of your site, a list of any URLs from which you intend to link to this Service, and a list of the URLs on our site to which you would like to link. Wait 2-3 weeks for a response.

Approved organizations may hyperlink to this Service as follows:
  * By use of our corporate name.
  * By use of the uniform resource locator being linked to; or
  * By use of any other description of this Service being linked to that makes sense within the context and format of content on the linking party’s site.

No use of The Company's logo or other artwork will be allowed for linking absent a trademark license agreement.

### iFrames

Without prior approval and written permission, you may not create frames around this Service that alter its visual presentation or appearance.

### Content Liability

We shall not be hold responsible for any content that appears on this Service. You agree to protect and defend us against all claims that is rising on your Website. No link(s) should appear on any Website that may be interpreted as libelous, obscene or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.

### Your Privacy

Please read this Service's Privacy Policy accessible from https://bedan.me/privacy/.

### Reservation of Rights

We reserve the right to request that you remove all links or any particular link to this Service. You approve to immediately remove all links to this Service upon request. We also reserve the right to amen these terms and conditions and it’s linking policy at any time. By continuously linking to this Service, you agree to be bound to and follow these linking terms and conditions.

### Removal of links from this Service

If you find any link on this Service that is offensive for any reason, you are free to contact and inform us any moment. We will consider requests to remove links but we are not obligated to or so or to respond to you directly.

We do not ensure that the information on this Service is correct, we do not warrant its completeness or accuracy; nor do we promise to ensure that this Service remains available or that the material on this Service is kept up to date.

### Disclaimer

To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to this Service and the use of it. Nothing in this disclaimer will:

  * limit or exclude our or your liability for death or personal injury.
  * limit or exclude our or your liability for fraud or fraudulent misrepresentation.
  * limit any of our or your liabilities in any way that is not permitted under applicable law; or
  * exclude any of our or your liabilities that may not be excluded under applicable law.

The limitations and prohibitions of liability set in this Section and elsewhere in this disclaimer:
 * Are subject to the preceding paragraph; and
 * govern all liabilities arising under the disclaimer, including liabilities arising in contract, in tort and for breach of statutory duty.

As long as this Service and the information on it are provided free of charge, we will not be liable for any loss or damage of any nature.

### Consent

By using this Service, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.

### Contact Us

If you have any questions about our Terms and Conditions, please contact us:

  * **Email:** contact@herpproject.com
`;

const TermsAndConditions = () =>
{
  // on url change reset scroll position
  useEffect(() =>
  {
    document.title = 'Terms and Conditions';

    window.scrollTo(0, 0);
  }, [ window.location ]);

  return <ReactMarkdown className={ styles.container } source={ input }/>;
};

const styles = createStyle({
  container: {
    fontFamily: '"Montserrat", sans-serif',

    padding: '5vh 5vw'
  }
});

export default TermsAndConditions;