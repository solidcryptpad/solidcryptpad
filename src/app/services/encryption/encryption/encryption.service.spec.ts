import { TestBed } from '@angular/core/testing';
import { InvalidContentException } from 'src/app/exceptions/invalid-content';
import { WrongDecriptionKeyException } from 'src/app/exceptions/wrong-decription-key-exception';

import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  const sampleKey = 'some random key';
  const sampleMessage = 'hello world';
  const sampleBlob = new Blob(['im a turtle'], { type: 'text/turtle' });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncryptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create unique keys', () => {
    const key1 = service.generateNewKey();
    const key2 = service.generateNewKey();
    expect(key1).not.toBe(key2);
  });

  it('can decrypt an encrypted string', () => {
    const ciphertext = service.encryptString(sampleMessage, sampleKey);
    const plaintext = service.decryptString(ciphertext, sampleKey);
    expect(plaintext).toBe(sampleMessage);
  });

  it('decrypt throws WrongDecriptionKeyException when using a wrong key', () => {
    const ciphertext = service.encryptString(sampleMessage, sampleKey);
    expect(() => service.decryptString(ciphertext, 'wrong key?')).toThrowError(
      WrongDecriptionKeyException
    );
  });

  it('can decrypt an encrypted blob', async () => {
    const fetchSpy = spyOn<any>(service, 'fetch');
    fetchSpy.and.resolveTo(new Response(sampleBlob));
    const blobToDataURLSpy = spyOn<any>(
      service,
      'blobToDataURL'
    ).and.callThrough();

    const ciphertext = await service.encryptBlob(sampleBlob, sampleKey);
    const blob = await service.decryptAsBlob(ciphertext, sampleKey);

    expect(blob).toEqual(sampleBlob);
    const dataUrl = await blobToDataURLSpy.calls.first().returnValue;
    expect(fetchSpy).toHaveBeenCalledWith(dataUrl);
  });

  // this fails when karma runs with --no-watch and --browsers=ChromiumHeadlessCI
  // it looks like the crypto library behaves differently than to the Chromium version in this scenario
  xit('decryptAsBlob throws InvalidContentException when using a wrong key', async () => {
    const ciphertext = await service.encryptBlob(sampleBlob, sampleKey);

    await expectAsync(
      service.decryptAsBlob(ciphertext, 'wrong key')
    ).toBeRejectedWithError(InvalidContentException);
  });

  it('SHA256Salted creates uses the salt 1205sOlIDCryptPADsalt1502', () => {
    const expectedSalt = '1205sOlIDCryptPADsalt1502';
    const sha256Spy = spyOn<any>(service, 'SHA256');
    sha256Spy.and.callThrough();

    service.SHA256Salted('test');

    expect(sha256Spy).toHaveBeenCalledWith('test' + expectedSalt);
  });
});
