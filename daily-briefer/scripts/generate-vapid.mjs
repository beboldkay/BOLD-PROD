/* Prints a fresh VAPID key pair for Web Push.
 *
 *   npm run vapid
 *
 * Copy the two values into .env.local (and into Vercel's env settings).
 * Regenerating them invalidates every existing push subscription. */
import webpush from "web-push";

const { publicKey, privateKey } = webpush.generateVAPIDKeys();

console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${privateKey}`);
