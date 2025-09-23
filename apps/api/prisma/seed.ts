import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Polybright Manufacturing',
      timezone: 'Asia/Manila',
      currency: 'PHP'
    }
  });

  const adminPassword = await hashPassword('Admin123!');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@polybright.test' },
    update: {},
    create: {
      orgId: tenant.id,
      email: 'admin@polybright.test',
      passwordHash: adminPassword,
      role: 'admin'
    }
  });

  const mainWarehouse = await prisma.warehouse.upsert({
    where: { id: '00000000-0000-4000-8000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000010',
      orgId: tenant.id,
      name: 'Main Warehouse',
      code: 'MAIN'
    }
  });

  const secondaryWarehouse = await prisma.warehouse.upsert({
    where: { id: '00000000-0000-4000-8000-000000000011' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000011',
      orgId: tenant.id,
      name: 'Secondary Warehouse',
      code: 'SEC'
    }
  });

  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: '00000000-0000-4000-8000-000000000101' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000101',
        orgId: tenant.id,
        name: 'Polybright LED Bulb 9W',
        sku: 'PB-LED-9W',
        barcode: 'PB0001',
        uom: 'pc'
      }
    }),
    prisma.product.upsert({
      where: { id: '00000000-0000-4000-8000-000000000102' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000102',
        orgId: tenant.id,
        name: 'Polybright LED Bulb 12W',
        sku: 'PB-LED-12W',
        barcode: 'PB0002',
        uom: 'pc'
      }
    }),
    prisma.product.upsert({
      where: { id: '00000000-0000-4000-8000-000000000103' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000103',
        orgId: tenant.id,
        name: 'Polybright Strip Light 5m',
        sku: 'PB-STRIP-5M',
        barcode: 'PB0003',
        uom: 'roll'
      }
    }),
    prisma.product.upsert({
      where: { id: '00000000-0000-4000-8000-000000000104' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000104',
        orgId: tenant.id,
        name: 'Polybright Smart Plug',
        sku: 'PB-PLUG',
        barcode: 'PB0004',
        uom: 'pc'
      }
    }),
    prisma.product.upsert({
      where: { id: '00000000-0000-4000-8000-000000000105' },
      update: {},
      create: {
        id: '00000000-0000-4000-8000-000000000105',
        orgId: tenant.id,
        name: 'Polybright Motion Sensor',
        sku: 'PB-SENSOR',
        barcode: 'PB0005',
        uom: 'pc'
      }
    })
  ]);

  for (const product of products) {
    await prisma.inventoryBalance.upsert({
      where: {
        orgId_warehouseId_productId: {
          orgId: tenant.id,
          warehouseId: mainWarehouse.id,
          productId: product.id
        }
      },
      update: { qty: { increment: 100 } },
      create: {
        orgId: tenant.id,
        warehouseId: mainWarehouse.id,
        productId: product.id,
        qty: 100
      }
    });

    await prisma.inventoryBalance.upsert({
      where: {
        orgId_warehouseId_productId: {
          orgId: tenant.id,
          warehouseId: secondaryWarehouse.id,
          productId: product.id
        }
      },
      update: { qty: { increment: 50 } },
      create: {
        orgId: tenant.id,
        warehouseId: secondaryWarehouse.id,
        productId: product.id,
        qty: 50
      }
    });
  }

  await prisma.purchaseOrder.create({
    data: {
      orgId: tenant.id,
      supplierName: 'Bright Supplies Co.',
      status: 'RECEIVED',
      items: {
        create: [
          { productId: products[0].id, qty: 100, unitPrice: 120 },
          { productId: products[1].id, qty: 100, unitPrice: 150 }
        ]
      }
    }
  });

  await prisma.salesOrder.create({
    data: {
      orgId: tenant.id,
      customerName: 'Metro Hardware',
      status: 'FULFILLED',
      items: {
        create: [
          { productId: products[2].id, qty: 20, unitPrice: 350 },
          { productId: products[3].id, qty: 10, unitPrice: 500 }
        ]
      }
    }
  });

  console.info('Seed completed. Admin login: admin@polybright.test / Admin123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
