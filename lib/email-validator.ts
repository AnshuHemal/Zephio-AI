/**
 * Disposable / temporary email domain blocklist.
 * Covers the most widely used throwaway email services.
 * Add more domains here as needed.
 */
const DISPOSABLE_DOMAINS = new Set([
  // Mailinator family
  "mailinator.com", "trashmail.com", "trashmail.net", "trashmail.org",
  "trashmail.at", "trashmail.io", "trashmail.me", "trashmail.xyz",
  // Guerrilla Mail
  "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
  "guerrillamail.biz", "guerrillamail.de", "guerrillamail.info",
  "grr.la", "guerrillamailblock.com", "spam4.me",
  // 10 Minute Mail
  "10minutemail.com", "10minutemail.net", "10minutemail.org",
  "10minutemail.co.uk", "10minutemail.de", "10minutemail.ru",
  "10minemail.com", "10mail.org",
  // Temp Mail
  "tempmail.com", "tempmail.net", "tempmail.org", "temp-mail.org",
  "temp-mail.io", "tempmail.de", "tempmail.plus", "tempmailo.com",
  // YOPmail
  "yopmail.com", "yopmail.fr", "cool.fr.nf", "jetable.fr.nf",
  "nospam.ze.tc", "nomail.xl.cx", "mega.zik.dj", "speed.1s.fr",
  "courriel.fr.nf", "moncourrier.fr.nf", "monemail.fr.nf",
  // Throwam / Fake inbox
  "throwam.com", "fakeinbox.com", "mailnull.com", "spamgourmet.com",
  "spamgourmet.net", "spamgourmet.org",
  // Dispostable
  "dispostable.com", "disposablemail.com", "disposableemailaddresses.com",
  // Sharklasers / Guerrilla variants
  "sharklasers.com", "guerrillamailblock.com", "spam4.me",
  "grr.la", "guerrillamail.info", "guerrillamail.biz",
  // Mailnesia / Mailnull
  "mailnesia.com", "mailnull.com",
  // Spambox
  "spambox.us", "spambox.info", "spambox.org",
  // Throwaway
  "throwaway.email", "throwam.com",
  // Maildrop
  "maildrop.cc",
  // Nada
  "nada.email", "nada.ltd",
  // Mohmal
  "mohmal.com",
  // Mailtemp
  "mailtemp.info", "mailtemp.net",
  // Getnada
  "getnada.com",
  // Anonaddy
  "anonaddy.com", "anonaddy.me",
  // SimpleLogin
  "simplelogin.co", "simplelogin.io",
  // Burner mail
  "burnermail.io",
  // Inboxkitten
  "inboxkitten.com",
  // Spamgourmet
  "spamgourmet.com",
  // Crap mail
  "crapmail.org",
  // Mailsac
  "mailsac.com",
  // Harakirimail
  "harakirimail.com",
  // Getairmail
  "getairmail.com",
  // Filzmail
  "filzmail.com",
  // Emailondeck
  "emailondeck.com",
  // Spamevader
  "spamevader.com",
  // Owlpic
  "owlpic.com",
  // Discard
  "discard.email",
  // Mailexpire
  "mailexpire.com",
  // Spamfree24
  "spamfree24.org", "spamfree24.de", "spamfree24.eu", "spamfree24.info",
  "spamfree24.net",
  // Wegwerfmail
  "wegwerfmail.de", "wegwerfmail.net", "wegwerfmail.org",
  // Sofort-mail
  "sofort-mail.de",
  // Einrot
  "einrot.com", "einrot.de",
  // Spamgob
  "spamgob.com",
  // Mailzilla
  "mailzilla.com", "mailzilla.org",
  // Jetable
  "jetable.com", "jetable.net", "jetable.org", "jetable.fr.nf",
  // Meltmail
  "meltmail.com",
  // Spamhole
  "spamhole.com",
  // Trashmail
  "trash-mail.at", "trash-mail.com", "trash-mail.de", "trash-mail.io",
  "trash-mail.net",
  // Mailscrap
  "mailscrap.com",
  // Spamfighter
  "spamfighter.com",
  // Tempr
  "tempr.email",
  // Emailfake
  "emailfake.com",
  // Fakemailgenerator
  "fakemailgenerator.com",
  // Spamgourmet
  "spamgourmet.com",
  // Mailboxy
  "mailboxy.fun",
  // Spamex
  "spamex.com",
  // Mailnew
  "mailnew.com",
  // Spamoff
  "spamoff.de",
  // Spamspot
  "spamspot.com",
  // Spamthis
  "spamthis.co.uk",
  // Spamtrap
  "spamtrap.ro",
  // Spamwc
  "spamwc.de",
  // Spaml
  "spaml.com", "spaml.de",
  // Spammotel
  "spammotel.com",
  // Spamstack
  "spamstack.net",
  // Spamcero
  "spamcero.com",
  // Spamcon
  "spamcon.org",
  // Spamcorptastic
  "spamcorptastic.com",
  // Spamcowboy
  "spamcowboy.com", "spamcowboy.net", "spamcowboy.org",
  // Spamday
  "spamday.com",
  // Spamdecoy
  "spamdecoy.net",
  // Spamfree
  "spamfree.eu",
  // Spamhereplease
  "spamhereplease.com",
  // Spamify
  "spamify.com",
  // Spaminator
  "spaminator.de",
  // Spamkill
  "spamkill.info",
  // Spaml
  "spaml.com",
  // Spammehere
  "spammehere.com", "spammehere.net",
  // Spammingemail
  "spammingemail.com",
  // Spamok
  "spamok.com",
  // Spampal
  "spampal.de",
  // Spampoison
  "spampoison.com",
  // Spamrap
  "spamrap.com",
  // Spamsalad
  "spamsalad.in",
  // Spamslicer
  "spamslicer.com",
  // Spamthisplease
  "spamthisplease.com",
  // Spamtrail
  "spamtrail.com",
  // Spamtroll
  "spamtroll.net",
  // Spamwc
  "spamwc.de",
  // Spamwc
  "spamwc.net",
  // Ymail
  "ymail.com",
  // Mailinator variants
  "mailinator2.com", "mailinater.com", "mailinator.net",
  // Misc popular ones
  "getonemail.com", "getonemail.net",
  "incognitomail.com", "incognitomail.net", "incognitomail.org",
  "mailnew.com", "mailscrap.com",
  "mt2009.com", "mt2014.com",
  "mytrashmail.com", "mytrashmail.net",
  "notmailinator.com",
  "objectmail.com",
  "obobbo.com",
  "odaymail.com",
  "oneoffemail.com",
  "onewaymail.com",
  "online.ms",
  "oopi.org",
  "opayq.com",
  "ordinaryamerican.net",
  "otherinbox.com",
  "ourklips.com",
  "outlawspam.com",
  "ovpn.to",
  "owlpic.com",
  "pancakemail.com",
  "paplease.com",
  "pepbot.com",
  "pfui.ru",
  "pimpedupmyspace.com",
  "pjjkp.com",
  "plexolan.de",
  "poczta.onet.pl",
  "politikerclub.de",
  "poofy.org",
  "pookmail.com",
  "privacy.net",
  "privatdemail.net",
  "proxymail.eu",
  "prtnx.com",
  "punkass.com",
  "putthisinyourspamdatabase.com",
  "qq.com",
  "quickinbox.com",
  "rcpt.at",
  "recode.me",
  "recursor.net",
  "regbypass.com",
  "regbypass.comsafe-mail.net",
  "rejectmail.com",
  "rklips.com",
  "rmqkr.net",
  "royal.net",
  "rppkn.com",
  "rtrtr.com",
  "s0ny.net",
  "safe-mail.net",
  "safersignup.de",
  "safetymail.info",
  "safetypost.de",
  "sandelf.de",
  "saynotospams.com",
  "schafmail.de",
  "schrott-email.de",
  "secretemail.de",
  "secure-mail.biz",
  "selfdestructingmail.com",
  "sendspamhere.com",
  "senseless-entertainment.com",
  "services391.com",
  "sharklasers.com",
  "shieldedmail.com",
  "shitmail.de",
  "shitmail.me",
  "shitware.nl",
  "shmeriously.com",
  "shortmail.net",
  "sibmail.com",
  "sinnlos-mail.de",
  "skeefmail.com",
  "slapsfromlastnight.com",
  "slaskpost.se",
  "slave-auctions.net",
  "slopsbox.com",
  "slushmail.com",
  "smashmail.de",
  "smellfear.com",
  "snakemail.com",
  "sneakemail.com",
  "sneakmail.de",
  "snkmail.com",
  "sofimail.com",
  "sofort-mail.de",
  "sogetthis.com",
  "soisz.com",
  "solar-impact.pro",
  "solopilotos.com",
  "solvemail.info",
  "soodonims.com",
  "spam.la",
  "spam.su",
  "spam4.me",
  "spamavert.com",
  "spambob.com",
  "spambob.net",
  "spambob.org",
  "spambog.com",
  "spambog.de",
  "spambog.ru",
  "spambox.info",
  "spambox.irishspringrealty.com",
  "spambox.org",
  "spambox.us",
  "spamcannon.com",
  "spamcannon.net",
  "spamcero.com",
  "spamcon.org",
  "spamcorptastic.com",
  "spamcowboy.com",
  "spamcowboy.net",
  "spamcowboy.org",
  "spamday.com",
  "spamdecoy.net",
  "spamex.com",
  "spamfree.eu",
  "spamfree24.de",
  "spamfree24.eu",
  "spamfree24.info",
  "spamfree24.net",
  "spamfree24.org",
  "spamgob.com",
  "spamgourmet.com",
  "spamgourmet.net",
  "spamgourmet.org",
  "spamherelots.com",
  "spamhereplease.com",
  "spamhole.com",
  "spamify.com",
  "spaminator.de",
  "spamkill.info",
  "spaml.com",
  "spaml.de",
  "spammehere.com",
  "spammehere.net",
  "spammingemail.com",
  "spammotel.com",
  "spamobox.com",
  "spamoff.de",
  "spamok.com",
  "spampal.de",
  "spampoison.com",
  "spamrap.com",
  "spamsalad.in",
  "spamslicer.com",
  "spamspot.com",
  "spamstack.net",
  "spamthis.co.uk",
  "spamthisplease.com",
  "spamtrail.com",
  "spamtroll.net",
  "spamwc.de",
  "spamwc.net",
  "spamwc.org",
  "spamwc.us",
  "speed.1s.fr",
  "spoofmail.de",
  "stuffmail.de",
  "super-auswahl.de",
  "supergreatmail.com",
  "supermailer.jp",
  "superrito.com",
  "superstachel.de",
  "suremail.info",
  "svk.jp",
  "sweetxxx.de",
  "tafmail.com",
  "tagyourself.com",
  "talkinator.com",
  "tapchicuoihoi.com",
  "teewars.org",
  "teleworm.com",
  "teleworm.us",
  "temp-mail.ru",
  "tempalias.com",
  "tempe-mail.com",
  "tempemail.biz",
  "tempemail.com",
  "tempemail.net",
  "tempinbox.co.uk",
  "tempinbox.com",
  "tempmail.eu",
  "tempmail.it",
  "tempmail2.com",
  "tempmailer.com",
  "tempmailer.de",
  "tempomail.fr",
  "temporaryemail.net",
  "temporaryemail.us",
  "temporaryforwarding.com",
  "temporaryinbox.com",
  "temporarymailaddress.com",
  "tempsky.com",
  "tempthe.net",
  "tempymail.com",
  "thanksnospam.info",
  "thc.st",
  "thelimestones.com",
  "thisisnotmyrealemail.com",
  "thismail.net",
  "thismail.ru",
  "throwam.com",
  "throwaway.email",
  "throwaways.net",
  "tilien.com",
  "tittbit.in",
  "tizi.com",
  "tmailinator.com",
  "toiea.com",
  "toomail.biz",
  "topranklist.de",
  "tradermail.info",
  "trash-mail.at",
  "trash-mail.com",
  "trash-mail.de",
  "trash-mail.ga",
  "trash-mail.io",
  "trash-mail.net",
  "trash-mail.tk",
  "trash2009.com",
  "trash2010.com",
  "trash2011.com",
  "trashdevil.com",
  "trashdevil.de",
  "trashemail.de",
  "trashimail.de",
  "trashmail.app",
  "trashmail.at",
  "trashmail.com",
  "trashmail.de",
  "trashmail.io",
  "trashmail.me",
  "trashmail.net",
  "trashmail.org",
  "trashmail.xyz",
  "trashmailer.com",
  "trashspam.com",
  "trbvm.com",
  "trbvn.com",
  "trbvo.com",
  "trickmail.net",
  "trillianpro.com",
  "tryalert.com",
  "turual.com",
  "twinmail.de",
  "tyldd.com",
  "uggsrock.com",
  "umail.net",
  "uroid.com",
  "us.af",
  "venompen.com",
  "veryrealemail.com",
  "viditag.com",
  "viewcastmedia.com",
  "viewcastmedia.net",
  "viewcastmedia.org",
  "vomoto.com",
  "vpn.st",
  "vsimcard.com",
  "vubby.com",
  "wasteland.raptors.dk",
  "webemail.me",
  "weg-werf-email.de",
  "wegwerf-email-addressen.de",
  "wegwerf-emails.de",
  "wegwerfadresse.de",
  "wegwerfmail.de",
  "wegwerfmail.info",
  "wegwerfmail.net",
  "wegwerfmail.org",
  "wh4f.org",
  "whyspam.me",
  "willhackforfood.biz",
  "willselfdestruct.com",
  "winemaven.info",
  "wronghead.com",
  "wuzupmail.net",
  "www.e4ward.com",
  "www.gishpuppy.com",
  "www.mailinator.com",
  "wwwnew.eu",
  "xagloo.co",
  "xagloo.com",
  "xemaps.com",
  "xents.com",
  "xmaily.com",
  "xoxy.net",
  "xyzfree.net",
  "yapped.net",
  "yeah.net",
  "yep.it",
  "yogamaven.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "yourdomain.com",
  "ypmail.webarnak.fr.eu.org",
  "yuurok.com",
  "z1p.biz",
  "za.com",
  "zehnminuten.de",
  "zehnminutenmail.de",
  "zetmail.com",
  "zippymail.info",
  "zoaxe.com",
  "zoemail.com",
  "zoemail.net",
  "zoemail.org",
  "zomg.info",
  "zxcv.com",
  "zxcvbnm.com",
  "zzz.com",
])

export type EmailValidationResult =
  | { valid: true }
  | { valid: false; reason: string }

/**
 * Validates an email address:
 * - Checks basic format
 * - Blocks disposable / temporary email domains
 */
export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim().toLowerCase()

  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    return { valid: false, reason: "Please enter a valid email address." }
  }

  const domain = trimmed.split("@")[1]

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      reason: "Temporary or disposable email addresses are not allowed. Please use a real email.",
    }
  }

  return { valid: true }
}
