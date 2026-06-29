import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import { encryptField } from '../lib/encryption'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database starting...')

  // 1. Clear existing data in reverse order
  await prisma.auditLog.deleteMany({})
  await prisma.notification.deleteMany({})
  await prisma.pembayaran.deleteMany({})
  await prisma.antrian.deleteMany({})
  await prisma.resepItem.deleteMany({})
  await prisma.resep.deleteMany({})
  await prisma.rekamMedis.deleteMany({})
  await prisma.pendaftaran.deleteMany({})
  await prisma.pasien.deleteMany({})
  await prisma.jadwalPerawat.deleteMany({})
  await prisma.jadwalDokter.deleteMany({})
  await prisma.perawat.deleteMany({})
  await prisma.dokter.deleteMany({})
  await prisma.poli.deleteMany({})
  await prisma.obat.deleteMany({})
  await prisma.stokLog.deleteMany({})
  await prisma.alatKesehatan.deleteMany({})
  await prisma.fasilitas.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('Cleanup completed.')

  // 2. Create Users with Hashed Passwords
  const adminPassword = await bcrypt.hash('AdminPass123!', 10)
  const staffPassword = await bcrypt.hash('StaffPass123!', 10)
  const doctorPassword = await bcrypt.hash('DokterPass123!', 10)
  const nursePassword = await bcrypt.hash('PerawatPass123!', 10)
  const apotekerPassword = await bcrypt.hash('ApotekerPass123!', 10)
  const kasirPassword = await bcrypt.hash('KasirPass123!', 10)
  const stokPassword = await bcrypt.hash('StokPass123!', 10)

  const uAdmin = await prisma.user.create({
    data: { email: 'admin@klinik.com', password: adminPassword, nama: 'Admin Klinik', role: 'ADMIN' }
  })
  const uFo = await prisma.user.create({
    data: { email: 'fo@klinik.com', password: staffPassword, nama: 'Rara (Front Office)', role: 'FRONT_OFFICE' }
  })
  const uDocBudi = await prisma.user.create({
    data: { email: 'dokter.budi@klinik.com', password: doctorPassword, nama: 'dr. Budi Setiawan', role: 'DOKTER' }
  })
  const uDocSiti = await prisma.user.create({
    data: { email: 'dokter.siti@klinik.com', password: doctorPassword, nama: 'drg. Siti Aminah', role: 'DOKTER' }
  })
  const uNurseDian = await prisma.user.create({
    data: { email: 'perawat@klinik.com', password: nursePassword, nama: 'Ners Dian', role: 'PERAWAT' }
  })
  const uApoAndi = await prisma.user.create({
    data: { email: 'apoteker@klinik.com', password: apotekerPassword, nama: 'Apt. Andi', role: 'APOTEKER' }
  })
  const uKasirKiki = await prisma.user.create({
    data: { email: 'kasir@klinik.com', password: kasirPassword, nama: 'Kiki (Kasir)', role: 'KASIR' }
  })
  const uStokBayu = await prisma.user.create({
    data: { email: 'stok@klinik.com', password: stokPassword, nama: 'Bayu (Logistik)', role: 'MANAJER_STOK' }
  })

  console.log('Users created.')

  // 3. Create Polis
  const pUmum = await prisma.poli.create({ data: { nama: 'Poli Umum', deskripsi: 'Pemeriksaan kesehatan umum' } })
  const pGigi = await prisma.poli.create({ data: { nama: 'Poli Gigi', deskripsi: 'Pemeriksaan gigi dan mulut' } })
  const pAnak = await prisma.poli.create({ data: { nama: 'Poli Anak', deskripsi: 'Pemeriksaan spesialis anak' } })
  const pKia = await prisma.poli.create({ data: { nama: 'Poli KIA', deskripsi: 'Kesehatan Ibu dan Anak' } })

  console.log('Polis created.')

  // 4. Create Dokter & Perawat
  const dBudi = await prisma.dokter.create({
    data: { userId: uDocBudi.id, nama: 'dr. Budi Setiawan', spesialisasi: 'Dokter Umum', telepon: '08123456789', poliId: pUmum.id }
  })
  const dSiti = await prisma.dokter.create({
    data: { userId: uDocSiti.id, nama: 'drg. Siti Aminah', spesialisasi: 'Dokter Gigi', telepon: '08111222333', poliId: pGigi.id }
  })
  const pDian = await prisma.perawat.create({
    data: { userId: uNurseDian.id, nama: 'Ners Dian', telepon: '08222333444' }
  })

  console.log('Doctors & Nurses created.')

  // 5. Create JadwalDokter
  const j1 = await prisma.jadwalDokter.create({
    data: { dokterId: dBudi.id, poliId: pUmum.id, hari: 'SENIN', jamMulai: '08:00', jamSelesai: '12:00', kuota: 20 }
  })
  const j2 = await prisma.jadwalDokter.create({
    data: { dokterId: dBudi.id, poliId: pUmum.id, hari: 'SELASA', jamMulai: '08:00', jamSelesai: '12:00', kuota: 20 }
  })
  const j3 = await prisma.jadwalDokter.create({
    data: { dokterId: dBudi.id, poliId: pUmum.id, hari: 'RABU', jamMulai: '08:00', jamSelesai: '12:00', kuota: 20 }
  })
  const j4 = await prisma.jadwalDokter.create({
    data: { dokterId: dSiti.id, poliId: pGigi.id, hari: 'SENIN', jamMulai: '13:00', jamSelesai: '17:00', kuota: 15 }
  })
  const j5 = await prisma.jadwalDokter.create({
    data: { dokterId: dSiti.id, poliId: pGigi.id, hari: 'RABU', jamMulai: '13:00', jamSelesai: '17:00', kuota: 15 }
  })

  console.log('Doctor Schedules created.')

  // 6. Create JadwalPerawat
  const today = new Date()
  await prisma.jadwalPerawat.create({
    data: { perawatId: pDian.id, poliId: pUmum.id, tanggal: new Date(today.getFullYear(), today.getMonth(), today.getDate()), shift: 'PAGI' }
  })

  console.log('Nurse Schedules created.')

  // 7. Create Medicines (Obat)
  const oParacetamol = await prisma.obat.create({
    data: {
      kode: 'OBT-001',
      nama: 'Paracetamol 500mg',
      satuan: 'Tablet',
      stok: 150,
      stokMinimum: 20,
      hargaBeli: 200,
      hargaJual: 500,
      expiredDate: new Date(2028, 5, 29)
    }
  })
  const oAmoxicillin = await prisma.obat.create({
    data: {
      kode: 'OBT-002',
      nama: 'Amoxicillin 500mg',
      satuan: 'Tablet',
      stok: 80,
      stokMinimum: 15,
      hargaBeli: 500,
      hargaJual: 1000,
      expiredDate: new Date(2027, 8, 15)
    }
  })
  const oIbuprofen = await prisma.obat.create({
    data: {
      kode: 'OBT-003',
      nama: 'Ibuprofen 400mg',
      satuan: 'Tablet',
      stok: 12,
      stokMinimum: 15, // trigger low stock alert
      hargaBeli: 400,
      hargaJual: 800,
      expiredDate: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()) // near expired
    }
  })
  const oObh = await prisma.obat.create({
    data: {
      kode: 'OBT-004',
      nama: 'OBH Syrup 100ml',
      satuan: 'Botol',
      stok: 5,
      stokMinimum: 10, // trigger low stock alert
      hargaBeli: 5000,
      hargaJual: 8000,
      expiredDate: new Date(2027, 0, 10)
    }
  })

  console.log('Medicines created.')

  // Create initial stok logs
  await prisma.stokLog.createMany({
    data: [
      { obatId: oParacetamol.id, tipe: 'IN', jumlah: 150, keterangan: 'Initial Stock' },
      { obatId: oAmoxicillin.id, tipe: 'IN', jumlah: 80, keterangan: 'Initial Stock' },
      { obatId: oIbuprofen.id, tipe: 'IN', jumlah: 12, keterangan: 'Initial Stock' },
      { obatId: oObh.id, tipe: 'IN', jumlah: 5, keterangan: 'Initial Stock' },
    ]
  })

  // 8. Create Alat Kesehatan (Medical Equipment)
  await prisma.alatKesehatan.createMany({
    data: [
      { kode: 'ALK-001', nama: 'Stetoskop Littmann Classic III', jumlah: 3, kondisi: 'BAIK', lastMaintenance: new Date(2026, 1, 10), nextMaintenance: new Date(2026, 7, 10) },
      { kode: 'ALK-002', nama: 'Tensimeter Digital Omron HEM-7120', jumlah: 4, kondisi: 'BAIK', lastMaintenance: new Date(2026, 2, 14), nextMaintenance: new Date(2026, 8, 14) },
      { kode: 'ALK-003', nama: 'Dental Chair Unit Gnatus', jumlah: 1, kondisi: 'BAIK', lastMaintenance: new Date(2026, 0, 5), nextMaintenance: new Date(2026, 6, 5) },
      { kode: 'ALK-004', nama: 'Autoclave Sterilizer Memmert', jumlah: 1, kondisi: 'PERLU_KALIBRASI', lastMaintenance: new Date(2025, 11, 20), nextMaintenance: new Date(2026, 5, 20) },
    ]
  })

  console.log('Medical Equipments created.')

  // 9. Create Fasilitas
  await prisma.fasilitas.createMany({
    data: [
      { namaRuangan: 'Ruang Poli Umum', status: 'TERSEDIA' },
      { namaRuangan: 'Ruang Poli Gigi', status: 'TERSEDIA' },
      { namaRuangan: 'Ruang Poli Anak', status: 'TERSEDIA' },
      { namaRuangan: 'Ruang Apotik', status: 'DIGUNAKAN' },
      { namaRuangan: 'Ruang Kasir', status: 'TERSEDIA' },
      { namaRuangan: 'Ruang Triage / Pendaftaran', status: 'TERSEDIA' },
    ]
  })

  console.log('Facilities created.')

  // 10. Create Pasien (with encrypted fields NIK, Telepon, Alamat)
  const p1 = await prisma.pasien.create({
    data: {
      noRekamMedis: 'RM-260001',
      nik: encryptField('3171010101010001'),
      nama: 'Budi Santoso',
      tanggalLahir: new Date(1985, 3, 12),
      jenisKelamin: 'LAKI_LAKI',
      alamat: encryptField('Jl. Merdeka Raya No. 10A, Jakarta Pusat'),
      telepon: encryptField('08123456789'),
      email: 'budi.santoso@example.com'
    }
  })

  const p2 = await prisma.pasien.create({
    data: {
      noRekamMedis: 'RM-260002',
      nik: encryptField('3171010101010002'),
      nama: 'Siti Rahmawati',
      tanggalLahir: new Date(1992, 7, 24),
      jenisKelamin: 'PEREMPUAN',
      alamat: encryptField('Jl. Mawar Indah IV No. 12, Bekasi'),
      telepon: encryptField('087788990011'),
      email: 'siti.rahma@example.com'
    }
  })

  const p3 = await prisma.pasien.create({
    data: {
      noRekamMedis: 'RM-260003',
      nik: encryptField('3171010101010003'),
      nama: 'Andi Wijaya',
      tanggalLahir: new Date(2005, 11, 5),
      jenisKelamin: 'LAKI_LAKI',
      alamat: encryptField('Jl. Melati Raya No. 2, Tangerang'),
      telepon: encryptField('08991234567'),
      email: 'andi.wijaya@example.com'
    }
  })

  console.log('Patients created.')

  // Create a sample checked-in patient for today to test queue system
  const dateStr = today.toISOString().split('T')[0]
  const targetDate = new Date(`${dateStr}T00:00:00Z`)

  const pend1 = await prisma.pendaftaran.create({
    data: {
      pasienId: p1.id,
      poliId: pUmum.id,
      dokterId: dBudi.id,
      jadwalId: j1.id,
      tanggal: targetDate,
      status: 'MENUNGGU',
      sumber: 'OFFLINE',
      keluhan: 'Demam tinggi sejak 2 hari yang lalu, kepala pusing, dan batuk kering.',
      tensiSistolik: 120,
      tensiDiastolik: 80,
      beratBadan: 68,
      tinggiBadan: 172,
      suhuTubuh: 38.5,
      nadi: 88,
      triaseColor: 'KUNING'
    }
  })

  await prisma.antrian.create({
    data: {
      pendaftaranId: pend1.id,
      nomorAntrian: 1,
      status: 'MENUNGGU'
    }
  })

  console.log('Sample visit queue created.')
  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
