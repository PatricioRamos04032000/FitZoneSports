import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page } from '@playwright/test';

const email = process.env.E2E_EMAIL ?? 'socio@fitzone.com';
const password = process.env.E2E_PASSWORD ?? claveDelSeed();
const tarjetaAprobada = '4111111111111111';

test('el socio reserva, paga, consulta y descarga el comprobante', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('link', { name: 'Canchas' })).toBeVisible();

  await esperarDisponibilidad(page, () =>
    page.getByRole('link', { name: 'Canchas' }).click(),
  );

  const { cancha, cuando, sedeId } = await reservarPrimerTurnoLibre(page);

  const confirmacion = page.locator('.reserva-confirmacion');
  await expect(confirmacion).toContainText('¡Reserva creada correctamente!');
  await expect(confirmacion).toContainText('pendiente');

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Canchas', level: 1 })).toBeVisible();
  const sedeTrasRecarga = page.getByLabel('Sede');
  await expect(
    sedeTrasRecarga.locator(`option[value="${sedeId}"]`).first(),
  ).toBeAttached();
  if ((await sedeTrasRecarga.inputValue()) !== sedeId) {
    await esperarDisponibilidad(
      page,
      () => sedeTrasRecarga.selectOption(sedeId),
      { sedeId },
    );
  }
  const pendiente = page
    .locator('ul.mis-reservas > li')
    .filter({ hasText: cancha })
    .filter({ hasText: textoFlexible(cuando) })
    .filter({ hasText: 'pendiente' });
  await expect(pendiente).toHaveCount(1);
  await pendiente.getByRole('button', { name: 'Pagar reserva' }).click();

  await expect(page.getByRole('heading', { name: 'Checkout de pago' })).toBeVisible();
  await page.getByLabel('Número de tarjeta').fill(tarjetaAprobada);
  await page.getByLabel('Nombre en la tarjeta').fill('Socio FitZone');
  await page.getByLabel('Vencimiento').fill('12/30');
  await page.getByLabel('CVV').fill('123');
  await page.getByRole('button', { name: 'Pagar' }).click();

  await expect(page.getByRole('heading', { name: 'Pago aprobado' })).toBeVisible();
  await page.getByRole('link', { name: 'Volver a Canchas' }).click();

  await expect(page.getByRole('heading', { name: 'Canchas', level: 1 })).toBeVisible();
  const sede = page.getByLabel('Sede');
  await expect(sede.locator(`option[value="${sedeId}"]`).first()).toBeAttached();
  if ((await sede.inputValue()) !== sedeId) {
    await esperarDisponibilidad(page, () => sede.selectOption(sedeId), {
      sedeId,
    });
  }
  await expect(page.getByRole('heading', { name: 'Mis reservas' })).toBeVisible();
  const item = page
    .locator('ul.mis-reservas > li')
    .filter({ hasText: cancha })
    .filter({ hasText: textoFlexible(cuando) })
    .filter({ hasText: 'confirmada' });
  await expect(item).toHaveCount(1);

  const descarga = page.waitForEvent('download');
  await item.getByRole('button', { name: 'Comprobante PDF' }).click();
  const archivo = await descarga;
  const ruta = await archivo.path();
  expect(ruta).toBeTruthy();
  const bytes = await readFile(ruta!);
  expect(bytes.subarray(0, 5).toString('utf8')).toBe('%PDF-');
});

async function esperarDisponibilidad(
  page: Page,
  accion: () => Promise<void>,
  filtro?: { sedeId?: string; fecha?: string },
) {
  const respuesta = page.waitForResponse((res) => {
    if (
      !res.ok() ||
      res.request().method() !== 'GET' ||
      !res.url().includes('/canchas/disponibilidad')
    ) {
      return false;
    }
    if (!filtro?.sedeId && !filtro?.fecha) return true;
    const url = new URL(res.url());
    if (filtro.sedeId && url.searchParams.get('sedeId') !== filtro.sedeId) {
      return false;
    }
    if (filtro.fecha && url.searchParams.get('fecha') !== filtro.fecha) {
      return false;
    }
    return true;
  });
  await accion();
  await respuesta;
  await expect(page.getByLabel('Horario')).toBeEnabled();
}

async function reservarPrimerTurnoLibre(page: Page) {
  const sede = page.getByLabel('Sede');
  const fecha = page.locator('input[type="date"]');
  const horario = page.getByLabel('Horario');
  const hoy = await fecha.inputValue();
  const sedes = await sede.locator('option').evaluateAll((opciones) => [
    ...new Set(
      opciones
        .map((opcion) => (opcion as HTMLOptionElement).value)
        .filter((valor) => valor !== ''),
    ),
  ]);

  for (const sedeId of sedes) {
    if ((await sede.inputValue()) !== sedeId) {
      await esperarDisponibilidad(page, () => sede.selectOption(sedeId), {
        sedeId,
      });
    }
    if ((await fecha.inputValue()) !== hoy) {
      await esperarDisponibilidad(page, () => fecha.fill(hoy), {
        sedeId,
        fecha: hoy,
      });
    }
    if (
      await page.getByText('No hay canchas disponibles para esta sede.').isVisible()
    ) {
      continue;
    }

    let diaActual = hoy;
    for (let dia = 0; dia < 7; dia++) {
      if (dia > 0) {
        diaActual = diaSiguiente(diaActual);
        await esperarDisponibilidad(page, () => fecha.fill(diaActual), {
          sedeId,
          fecha: diaActual,
        });
      }

      const horas = await horario.locator('option').evaluateAll((opciones) =>
        opciones
          .map((opcion) => (opcion as HTMLOptionElement).value)
          .filter((valor) => valor !== ''),
      );

      for (const hora of horas) {
        if (turnoPasado(await fecha.inputValue(), hora)) {
          continue;
        }
        await horario.selectOption(hora);
        const card = page.locator('.cancha-card').filter({
          has: page.getByRole('button', { name: 'Reservar', exact: true }),
        });
        if ((await card.count()) === 0) {
          continue;
        }

        const elegida = card.first();
        const cancha = (await elegida.locator('h3').innerText()).trim();
        const diaElegido = await fecha.inputValue();
        const cuando = await page.evaluate(
          ({ diaElegido, hora }) =>
            new Date(`${diaElegido}T${hora}:00-03:00`).toLocaleString('es-AR', {
              timeZone: 'America/Argentina/Buenos_Aires',
              dateStyle: 'short',
              timeStyle: 'short',
            }),
          { diaElegido, hora },
        );
        await elegida.getByRole('button', { name: 'Reservar', exact: true }).click();
        return { cancha, cuando, sedeId };
      }
    }
  }

  throw new Error('No hay un turno libre en los próximos 7 días.');
}

function claveDelSeed() {
  const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  for (const archivo of ['backend/.env', '.env']) {
    try {
      const texto = readFileSync(resolve(raiz, archivo), 'utf8');
      const valor = texto.match(/^SEED_PASSWORD=(.*)$/m)?.[1]?.trim();
      if (valor) return valor;
    } catch {
      // Sin ese archivo, queda la contraseña publicada en el README.
    }
  }
  return 'fitzone-demo';
}

function turnoPasado(fecha: string, hora: string) {
  return Date.now() >= new Date(`${fecha}T${hora}:00-03:00`).getTime();
}

function diaSiguiente(fecha: string) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const date = new Date(Date.UTC(anio, mes - 1, dia));
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function textoFlexible(valor: string) {
  const partes = valor
    .split(/\s+/)
    .map((parte) => parte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(partes.join('\\s+'));
}
