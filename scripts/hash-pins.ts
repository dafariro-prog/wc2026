/**
 * Genera hashes bcrypt para los PIN. Úsalo para regenerar seed.sql o para
 * cambiar el PIN de un usuario.
 *
 * Uso:
 *   npm run hash:pins                 -> usa los PIN por defecto
 *   npm run hash:pins -- 4321 9999    -> hashea los PIN dados (en orden)
 */
import bcrypt from "bcryptjs";

const defaults: [string, string][] = [
  ["Daniel", "1234"],
  ["Camilo", "1111"],
  ["Luis H", "2222"],
  ["Miguel", "3333"],
];

const cliPins = process.argv.slice(2);

const entries = cliPins.length
  ? cliPins.map((pin, i) => [defaults[i]?.[0] ?? `Usuario ${i + 1}`, pin] as [string, string])
  : defaults;

for (const [name, pin] of entries) {
  const hash = bcrypt.hashSync(pin, 10);
  console.log(`${name.padEnd(8)} PIN=${pin}  ->  ${hash}`);
}
