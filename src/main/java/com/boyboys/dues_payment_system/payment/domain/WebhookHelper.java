package com.boyboys.dues_payment_system.payment.domain;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.apache.commons.codec.binary.Hex;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.List;

@Component
@Slf4j
public class WebhookHelper {

    @Value("${paystack.webhook.skip.ip.check:false}")
    private boolean isLocalEnvironment;

    private static final List<String> PAYSTACK_IPS = List.of(
            "52.31.139.75",
            "52.49.173.169",
            "52.214.14.220"

    );

    @Value("${paystack.secret}")
    private String secretKey;


    public boolean isValidIp(HttpServletRequest request) {
        if (isLocalEnvironment) return true; // skip in local
        String ip = getClientIp(request);
        return PAYSTACK_IPS.contains(ip);
    }
    public boolean isValidSignature(byte[] payload, String paystackSignature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] hmac = mac.doFinal(payload);
            String computedSignature = Hex.encodeHexString(hmac);
            log.info("Computed signature: {}", computedSignature);
            log.info("Paystack signature: {}", paystackSignature);
            return computedSignature.equals(paystackSignature);
        } catch (Exception e) {
            log.error("Error verifying webhook signature: {}", e.getMessage());
            return false;
        }

    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
