// Reads the people in the rotation from environment variables:
//
//   PERSON_1_NAME=...   PERSON_1_EMAIL=...
//   PERSON_2_NAME=...   PERSON_2_EMAIL=...
//   PERSON_3_NAME=...   PERSON_3_EMAIL=...
//
// The order of the numbers is the order of the rotation.
// To add someone, just create PERSON_4_NAME / PERSON_4_EMAIL.

export function getPeople() {
  const people = [];
  for (let i = 1; ; i++) {
    const name = process.env[`PERSON_${i}_NAME`]?.trim();
    if (!name) break;
    const email = process.env[`PERSON_${i}_EMAIL`]?.trim() || null;
    people.push({ name, email });
  }
  return people;
}
