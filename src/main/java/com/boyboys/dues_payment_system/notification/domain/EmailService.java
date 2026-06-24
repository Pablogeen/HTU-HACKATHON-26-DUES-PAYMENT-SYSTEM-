package com.boyboys.dues_payment_system.notification.domain;


import com.boyboys.dues_payment_system.payment.PaymentSucceededEvent;
import com.boyboys.dues_payment_system.student.StudentLoginEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final EmailOutboxRepository outboxRepository;


    @ApplicationModuleListener
    public void onStudentLogin(StudentLoginEvent event) {
        outboxRepository.save(new EmailOutbox(
                event.email(),
                "Verify Your Student Email — COMPSSA",
                EmailType.VERIFICATION,
                event.firstname()+ "|" + event.token()));
    }

    @ApplicationModuleListener
    public void paymentSucceededNotification(PaymentSucceededEvent event) {
        outboxRepository.save(new EmailOutbox(
                event.email(),
                "Thank You for Your Contribution — BEN & CO",
                EmailType.PAYMENT_SUCCEEDED,
                event.firstName()+ "|" + event.reference()));
    }
//
//    @ApplicationModuleListener
//    public void onArticleContributedNotifyAdmin(ArticleContributedEvent event) {
//        outboxRepository.save(new EmailOutbox(
//                adminEmail,
//                "New Article Submission — BEN & CO",
//                EmailType.ADMIN_NOTIFICATION,
//                event.articleTitle() + "|" + event.email()));
//    }
//
//    @ApplicationModuleListener
//    public void onArticleApproved(ArticleReviewedApprovedEvent event) {
//        outboxRepository.save(new EmailOutbox(
//                event.contributorEmail(),
//                "Your Article Has Been Approved — BEN & CO",
//                EmailType.ARTICLE_APPROVED,
//                event.articleTitle()));
//    }
//
//    @ApplicationModuleListener
//    public void onArticleRejected(ArticleReviewedRejectedEvent event) {
//        outboxRepository.save(new EmailOutbox(
//                event.contributorEmail(),
//                "Regarding Your Article Submission — BEN & CO",
//                EmailType.ARTICLE_REJECTED,
//                event.articleTitle()));
//    }
//
//    @ApplicationModuleListener
//    public void contactMe(ContactMeRequestEvent event) {
//
//            String reference = event.email() + "|" +
//                    event.phoneNumber() + "|" +
//                    event.reasonForContact() + "|" +
//                    event.message();
//
//            outboxRepository.save(new EmailOutbox(
//                    adminEmail,
//                    "CONTACT ME — BEN & CO",
//                    EmailType.CONTACT_ME,
//                    reference));
//
//            log.info("Contact me outbox saved successfully");
//        }
}