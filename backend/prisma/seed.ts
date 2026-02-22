import { PrismaClient, Sex, SymptomType } from '@prisma/client';

const prisma = new PrismaClient();

const SYMPTOM_TYPES = Object.values(SymptomType);
const SEXES = Object.values(Sex);

const FIRST_NAMES = [
  'Amara',
  'Fatima',
  'Grace',
  'Immaculée',
  'Josephine',
  'Kavya',
  'Liliane',
  'Marie',
  'Nadine',
  'Olive',
  'Patricia',
  'Reine',
  'Sarah',
  'Thérese',
  'Uwase',
  'Valentina',
  'Wanjiru',
  'Xolile',
  'Yvonne',
  'Zawadi',
  'Alice',
  'Beatrice',
  'Claudine',
  'Diane',
  'Esperance',
  'Flavia',
  'Giselle',
  'Honorine',
  'Irene',
  'Jacqueline',
  'Keza',
  'Laure',
  'Miriam',
  'Nathalie',
  'Odette',
  'Pascale',
  'Rachel',
  'Solange',
  'Tatiana',
  'Umurerwa',
  'Vestine',
  'Winnie',
  'Xenia',
  'Yolande',
  'Zoe',
  'Annette',
  'Brigitte',
  'Cecile',
  'Delphine',
  'Elise',
];

const LAST_NAMES = [
  'Uwimana',
  'Mukamana',
  'Nyirahabimana',
  'Habimana',
  'Nzeyimana',
  'Mukandori',
  'Uwitonze',
  'Ingabire',
  'Iradukunda',
  'Nizeyimana',
  'Tuyisenge',
  'Uwase',
  'Hakizimana',
  'Nsabimana',
  'Mukarurangwa',
  'Niyonzima',
  'Uwanyirigira',
  'Hategekimana',
  'Murerwa',
  'Bizimana',
  'Kayitesi',
  'Mukeshimana',
  'Ndayishimiye',
  'Umubyeyi',
  'Nyiraneza',
  'Rutagengwa',
  'Uwingabiye',
  'Gasana',
  'Kamanzi',
  'Mutabazi',
  'Nkurunziza',
  'Rugamba',
  'Tuyizere',
  'Uwamahoro',
  'Niyomugabo',
  'Habumugisha',
  'Izabayo',
  'Kalisa',
  'Manirafasha',
  'Nshimiyimana',
  'Rubayiza',
  'Tumukunde',
  'Uwizeyimana',
  'Niyongira',
  'Habiyaremye',
  'Ishimwe',
  'Kagabo',
  'Maniraho',
  'Nshimiye',
  'Rugwiro',
];

const NOTES_POOL = [
  'Pain is worse in the morning',
  'Noticed this after physical activity',
  'Has been persistent for a week',
  'Came on suddenly yesterday',
  'Mild discomfort but noticeable',
  'Getting progressively worse',
  'Slightly better after rest',
  'No improvement with over-the-counter medication',
  'Associated with mild fever',
  'Occurs mainly at night',
  'Radiates to the shoulder',
  'Accompanied by fatigue',
  'Noticed after breastfeeding',
  'Worsens when lying down',
  'Intermittent, not constant',
  null,
  null,
  null,
  null,
  null, // 25% chance of null notes
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number): Date {
  const now = new Date();
  const past = new Date(now.getTime() - daysBack * 86400000);
  return new Date(
    past.getTime() + Math.random() * (now.getTime() - past.getTime()),
  );
}

function randomPhone(): string {
  return `+2507${randomInt(20, 99)}${randomInt(100000, 999999)}`;
}

function weightedSeverity(): number {
  // More realistic distribution — mostly mild-moderate, some severe
  const weights = [20, 30, 25, 15, 10]; // 1=20%, 2=30%, 3=25%, 4=15%, 5=10%
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return i + 1;
  }
  return 3;
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.symptom.deleteMany();
  await prisma.patient.deleteMany();
  console.log('🗑️  Cleared existing data');

  for (let i = 0; i < 50; i++) {
    const firstName = FIRST_NAMES[i];
    const lastName = LAST_NAMES[i];

    const patient = await prisma.patient.create({
      data: {
        name: `${firstName} ${lastName}`,
        age: randomInt(18, 75),
        sex: randomItem(SEXES),
        contactInfo: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com | ${randomPhone()}`,
      },
    });

    // Generate 50 symptoms per patient
    const symptomsData = Array.from({ length: 50 }, () => ({
      patientId: patient.id,
      type: randomItem(SYMPTOM_TYPES),
      severity: weightedSeverity(),
      dateOfOccurrence: randomDate(90), // spread over last 90 days
      notes: randomItem(NOTES_POOL) as string | null,
    }));

    await prisma.symptom.createMany({ data: symptomsData });

    console.log(`✅ Patient ${i + 1}/50: ${patient.name} — 50 symptoms seeded`);
  }

  // Seed one "alert" patient — guaranteed to trigger alert flag
  const alertPatient = await prisma.patient.create({
    data: {
      name: 'Test Alert Patient',
      age: 45,
      sex: Sex.FEMALE,
      contactInfo: 'alert.patient@test.com | +250700000000',
    },
  });

  const recentDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i); // last 5 days
    return d;
  });

  await prisma.symptom.createMany({
    data: recentDates.map((date) => ({
      patientId: alertPatient.id,
      type: SymptomType.BREAST_PAIN,
      severity: 5,
      dateOfOccurrence: date,
      notes: 'Severe pain — alert test patient',
    })),
  });

  console.log(`🚨 Alert test patient seeded: ${alertPatient.name}`);
  console.log(
    '\n🎉 Seed complete! 50 patients × 50 symptoms + 1 alert patient',
  );
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
