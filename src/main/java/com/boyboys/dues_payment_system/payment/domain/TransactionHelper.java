package com.boyboys.dues_payment_system.payment.domain;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.UUID;

@Component
@Slf4j
public class TransactionHelper {

    private static final long DUES_AMOUNT_CEDIS = 100L;
    private static final long PESEWAS_MULTIPLIER = 100L;

    public String generateReference() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYT0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder("COMPSSA-");
        for(int i = 0; i < 6; i++){
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public long convertCedisToPesewas(long amountInCedis) {
        return amountInCedis * PESEWAS_MULTIPLIER;
    }

   // public long convertPesewasToCedis(long amountInPesewas) {
    //    return amountInPesewas / PESEWAS_MULTIPLIER;
    //}

    public long getDuesAmountInPesewas() {
        return convertCedisToPesewas(DUES_AMOUNT_CEDIS);
    }
}