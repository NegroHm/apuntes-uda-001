// Archivo: src/app/api/encrypt-helper/route.ts
import { NextResponse } from 'next/server';
// CAMBIO 1: Importamos la instancia { encryptionService } directamente por su nombre.
import { encryptionService } from '~/lib/utils.server';

export async function GET() {
  // IDs que necesitamos encriptar
  const ROOT_FOLDER_ID = '1oOYF9Od5NeSErp7lokq95pQ37voukBvu';
  // **IMPORTANTE**: Reemplaza este ID con el de tu Shared Drive real.
  const SHARED_DRIVE_ID = '1oOYF9Od5NeSErp7lokq95pQ37voukBvu'; 
https://drive.google.com/drive/folders/1hsqWI0nFNoViQmegoGiEv6ITlmt4y0xX?usp=sharing
  try {
    // CAMBIO 2: Usamos "await" y llamamos al método "encrypt" desde la instancia importada.
    const encryptedRootFolder = await encryptionService.encrypt(ROOT_FOLDER_ID);
    const encryptedSharedDrive = await encryptionService.encrypt(SHARED_DRIVE_ID);

    return NextResponse.json({
      encryptedRootFolder,
      encryptedSharedDrive,
    });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json({ error: 'Fallo la encriptación: ' + error.message }, { status: 500 });
  }
}