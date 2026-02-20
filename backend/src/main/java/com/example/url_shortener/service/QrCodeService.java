package com.example.url_shortener.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for generating QR codes using the ZXing library.
 *
 * QR codes are generated on-the-fly as PNG byte arrays.
 * For high-traffic scenarios, these could be cached in Redis or stored in S3.
 */
@Service
@Slf4j
public class QrCodeService {

    private static final int DEFAULT_SIZE = 300; // 300x300 pixels
    private static final String FORMAT = "PNG";

    /**
     * Generate a QR code PNG image for the given URL.
     *
     * @param url  The URL to encode in the QR code (should be the full short URL)
     * @param size Width and height in pixels (default 300)
     * @return PNG image as byte array
     */
    public byte[] generateQrCode(String url, int size) {
        try {
            QRCodeWriter writer = new QRCodeWriter();

            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H); // High error correction
            hints.put(EncodeHintType.MARGIN, 2);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

            BitMatrix bitMatrix = writer.encode(url, BarcodeFormat.QR_CODE, size, size, hints);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, FORMAT, outputStream);
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate QR code for URL: {}", url, e);
            throw new RuntimeException("QR code generation failed");
        }
    }

    public byte[] generateQrCode(String url) {
        return generateQrCode(url, DEFAULT_SIZE);
    }
}
