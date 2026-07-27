import { StarRailSDK, calculateDamage, calculateActionValue } from '../src/index.js';

async function main() {
  console.log('--- 1. Calculator Examples ---');
  
  // Calculate Base Damage
  const damage = calculateDamage({
    scalingStat: 2000,
    skillMultiplier: 1.5,
    dmgBoostPercent: 0.2,
    targetBaseDef: 1000,
    attackerLevel: 80,
    defShred: 0.1,
    defIgnore: 0,
    targetRes: 0.2,
    resPen: 0,
    vulnerabilityPercent: 0,
    isBroken: false,
    critRate: 0.75,
    critDmg: 1.5,
  });
  console.log('Calculated Damage:', damage);

  // Calculate Action Value
  const av = calculateActionValue(134);
  console.log('Action Value at 134 SPD:', av.toFixed(2));

  console.log('\n--- 2. SDK Instance Example ---');
  const sdk = new StarRailSDK({ lang: 'en' });
  
  try {
    const characters = await sdk.res.getCharacters();
    console.log('Fetched characters count from StarRailRes:', Object.keys(characters).length);
  } catch (err) {
    console.log('Could not fetch online assets:', (err as Error).message);
  }
}

main();
