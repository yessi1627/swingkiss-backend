const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  const demo = await prisma.usuario.upsert({
    where: { email: 'demo@swingkiss.com' },
    update: {},
    create: {
      nombre: 'Usuario Demo',
      email: 'demo@swingkiss.com',
      passwordHash,
      tipoCuenta: 'individual',
      rol: 'gratis',
      bio: 'Cuéntale al mundo algo sobre ti y lo que buscas.',
      interesesJson: JSON.stringify(['Viajes', 'Música']),
    },
  });

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@swingkiss.com' },
    update: {},
    create: {
      nombre: 'Admin SwingKiss',
      email: 'admin@swingkiss.com',
      passwordHash,
      tipoCuenta: 'individual',
      rol: 'admin',
      bio: 'Cuenta de administración de la plataforma.',
      verificado: true,
    },
  });

  const premium = await prisma.usuario.upsert({
    where: { email: 'premium@swingkiss.com' },
    update: {},
    create: {
      nombre: 'Usuario Premium',
      email: 'premium@swingkiss.com',
      passwordHash,
      tipoCuenta: 'pareja',
      rol: 'premium',
      bio: 'Cuenta con membresía activa: likes ilimitados y puede crear eventos.',
      interesesJson: JSON.stringify(['Eventos', 'Viajes']),
      verificado: true,
    },
  });

  const perfiles = [
    {
      nombre: 'Lucía & Marcos',
      email: 'luciaymarcos@ejemplo.com',
      tipoCuenta: 'pareja',
      edad: 32,
      ubicacion: 'Bogotá, Colombia',
      bio: 'Pareja bacana buscando nuevas conexiones y buena conversa antes que todo.',
      intereses: ['Viajes', 'Aguardiente', 'Baile', 'Rumba'],
      verificado: true,
    },
    {
      nombre: 'Carla',
      email: 'carla@ejemplo.com',
      tipoCuenta: 'individual',
      edad: 27,
      ubicacion: 'Medellín, Colombia',
      bio: 'Mente abierta, curiosa y directa. Me gusta conocer gente sin afanes.',
      intereses: ['Yoga', 'Cine', 'Fotografía'],
      verificado: false,
    },
    {
      nombre: 'Diego & Ana',
      email: 'diegoyana@ejemplo.com',
      tipoCuenta: 'pareja',
      edad: 35,
      ubicacion: 'Cali, Colombia',
      bio: 'Nos encanta la rumba entre parejas y conocer gente afín a nuestro estilo de vida.',
      intereses: ['Fiestas', 'Salsa', 'Gastronomía'],
      verificado: true,
    },
    {
      nombre: 'Sofía',
      email: 'sofia@ejemplo.com',
      tipoCuenta: 'individual',
      edad: 29,
      ubicacion: 'Barranquilla, Colombia',
      bio: 'Extrovertida, sin tabúes ni vueltas. Busco complicidad más que cantidad.',
      intereses: ['Playa', 'Cocina', 'Series'],
      verificado: true,
    },
    {
      nombre: 'Iván & Paula',
      email: 'ivanypaula@ejemplo.com',
      tipoCuenta: 'pareja',
      edad: 38,
      ubicacion: 'Cartagena, Colombia',
      bio: 'Pareja discreta, primera vez explorando la comunidad. Vamos con calma, sin afán.',
      intereses: ['Naturaleza', 'Deporte', 'Lectura'],
      verificado: false,
    },
  ];

  for (const p of perfiles) {
    await prisma.usuario.upsert({
      where: { email: p.email },
      update: {},
      create: {
        nombre: p.nombre,
        email: p.email,
        passwordHash,
        tipoCuenta: p.tipoCuenta,
        edad: p.edad,
        ubicacion: p.ubicacion,
        bio: p.bio,
        interesesJson: JSON.stringify(p.intereses),
        verificado: p.verificado,
      },
    });
  }

  console.log('Seed completo. Usuarios de prueba (todos con password: 123456):');
  console.log(`  - ${admin.email}   -> rol: admin   (ve todo, panel de administración)`);
  console.log(`  - ${premium.email} -> rol: premium (likes ilimitados, puede crear eventos)`);
  console.log(`  - ${demo.email}    -> rol: gratis   (máx. 5 likes al día)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
