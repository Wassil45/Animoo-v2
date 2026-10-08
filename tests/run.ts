import { runReciprocalMatchTests } from './reciprocal_match.test';
import { runRlsSecurityTests } from './rls_security.test';
import { runBlockingTests } from './blocking.test';

async function main() {
  console.log('\n========================================');
  console.log('🐾 SUITE DE TESTS AUTOMATISÉE - ANIMOO');
  console.log('========================================\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // 1. SCÉNARIO 1 : Match Réciproque
  console.log('🔹 SCÉNARIO 1 : MATCH RÉCIPROQUE');
  const reciprocalResults = runReciprocalMatchTests();
  for (const res of reciprocalResults) {
    totalTests++;
    if (res.passed) {
      passedTests++;
      console.log(`  ✔ ${res.name}`);
    } else {
      failedTests++;
      console.error(`  ✖ ${res.name}: ${res.error}`);
    }
  }

  // 2. SCÉNARIO 2 : Politiques RLS & Confidentialité
  console.log('\n🔹 SCÉNARIO 2 : POLITIQUES RLS & CONFIDENTIALITÉ');
  const rlsResults = runRlsSecurityTests();
  for (const res of rlsResults) {
    totalTests++;
    if (res.passed) {
      passedTests++;
      console.log(`  ✔ ${res.name}`);
    } else {
      failedTests++;
      console.error(`  ✖ ${res.name}: ${res.error}`);
    }
  }

  // 3. SCÉNARIO 3 : Blocage & Signalement
  console.log('\n🔹 SCÉNARIO 3 : BLOCAGE ET SIGNALEMENT');
  const blockingResults = runBlockingTests();
  for (const res of blockingResults) {
    totalTests++;
    if (res.passed) {
      passedTests++;
      console.log(`  ✔ ${res.name}`);
    } else {
      failedTests++;
      console.error(`  ✖ ${res.name}: ${res.error}`);
    }
  }

  console.log('\n----------------------------------------');
  console.log(`Résultats : ${passedTests}/${totalTests} tests réussis`);
  console.log('----------------------------------------\n');

  if (failedTests > 0) {
    console.error(`❌ Échec : ${failedTests} test(s) ont échoué.`);
    process.exit(1);
  } else {
    console.log('✅ Tous les scénarios (Match réciproque, Politiques RLS, Blocage) passent avec succès !');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Erreur inattendue lors de l’exécution des tests:', err);
  process.exit(1);
});
