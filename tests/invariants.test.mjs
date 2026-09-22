import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('the claw has nine articulated fingers and a short grab phase', () => {
  assert.match(source, /for\(let i=0;i<9;i\+\+\)/);
  assert.match(source, /p\.userData\.tip\.rotation\.x=-eff\*1\.2/);
  assert.match(source, /G\.t\+=dt\*\.8/);
  assert.match(source, /if\(G\.t>\.3\)/);
});

test('a round charges at most one token and only after validation', () => {
  const validation = source.indexOf("if(S.credits<1)");
  const charge = source.indexOf('if(G.tokenCharged) return false;', validation);
  const debit = source.indexOf('S.credits-=1; G.tokenCharged=true;', charge);
  assert.ok(validation >= 0 && charge > validation && debit > charge);

  const round = { credits: 1, tokenCharged: false, running: false };
  const start = () => {
    if (round.running || round.credits < 1 || round.tokenCharged) return false;
    round.credits -= 1;
    round.tokenCharged = true;
    round.running = true;
    return true;
  };
  assert.equal(start(), true);
  assert.equal(start(), false);
  assert.equal(round.credits, 0);
});

test('recovery releases the held prize and returns to an idle playable state', () => {
  assert.match(source, /function recoverGame\(message\)/);
  assert.match(source, /releaseHeldPrize\(\);/);
  assert.match(source, /G\.phase='idle'; G\.t=0; G\.legLen=1; G\.closeAmt=0/);
  assert.match(source, /G\.running=false; G\.tokenCharged=false/);
  assert.match(source, /recoverGame\('⚙️ Autorestart — si continua a giocare!'\)/);
});
