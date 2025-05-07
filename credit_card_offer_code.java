import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CreditCardOfferService {
    
    private final CreditCardOfferRepository creditCardOfferRepository;
    
    public CreditCardOfferService(CreditCardOfferRepository creditCardOfferRepository) {
        this.creditCardOfferRepository = creditCardOfferRepository;
    }
    
    /**
     * Creates and returns a list of credit card offers based on predefined card data
     * @return List of CreditCardOffer objects
     */
    public List<CreditCardOffer> createCardOffers() {
        List<CreditCardOffer> offers = new ArrayList<>();
        
        // Define credit card data
        String[][] cardData = {
            // cardName, offerID, creditScoreRange, purchaseCategory
            {"PLATINUM CARD", "OFF-PLT-2025-07", "720-850", "travel, points, noAnnualFee"},
            {"CASH REWARDS ELITE", "OFF-CRE-2025-12", "690-850", "cashBack, points, allCards"},
            {"TRAVEL MILES UNLIMITED", "OFF-TMU-2025-09", "700-850", "travel, points, noAnnualFee"},
            {"EVERYDAY POINTS", "OFF-EVP-2025-05", "670-850", "points, cashBack, lowIntroRate"},
            {"SECURED BUILDER", "OFF-SCB-2025-08", "580-670", "buildCredit, noAnnualFee"},
            {"US BANK ALTITUDE GO VISA SIGNATURE", "OFF-USGV-2025-13", "690-850", "cashBack, noAnnualFee, points"},
            {"US BANK CASH+ VISA SIGNATURE", "OFF-USCV-2025-14", "680-850", "cashBack, points, allCards"},
            {"US BANK ALTITUDE RESERVE VISA INFINITE", "OFF-USRV-2025-15", "740-850", "travel, points, allCards"}
        };
        
        // Create and save each offer
        for (String[] card : cardData) {
            CreditCardOffer offer = new CreditCardOffer();
            offer.setCardName(card[0]);
            offer.setOfferId(card[1]);
            offer.setCreditScoreRange(card[2]);
            
            // Parse purchase categories from comma-separated string
            List<String> categories = Arrays.asList(card[3].split(", "));
            offer.setPurchaseCategories(categories);
            
            // Save to repository and add to result list
            offers.add(creditCardOfferRepository.save(offer));
        }
        
        return offers;
    }
    
    /**
     * Gets all offers that match a specific purchase category
     * @param category The purchase category to filter by
     * @return List of matching CreditCardOffer objects
     */
    public List<CreditCardOffer> getOffersByCategory(String category) {
        List<CreditCardOffer> allOffers = creditCardOfferRepository.findAll();
        List<CreditCardOffer> matchingOffers = new ArrayList<>();
        
        for (CreditCardOffer offer : allOffers) {
            if (offer.getPurchaseCategories().contains(category)) {
                matchingOffers.add(offer);
            }
        }
        
        return matchingOffers;
    }
    
    /**
     * Gets all offers suitable for a given credit score
     * @param creditScore The credit score to check
     * @return List of suitable CreditCardOffer objects
     */
    public List<CreditCardOffer> getOffersByCreditScore(int creditScore) {
        List<CreditCardOffer> allOffers = creditCardOfferRepository.findAll();
        List<CreditCardOffer> matchingOffers = new ArrayList<>();
        
        for (CreditCardOffer offer : allOffers) {
            String[] range = offer.getCreditScoreRange().split("-");
            int minScore = Integer.parseInt(range[0]);
            int maxScore = Integer.parseInt(range[1]);
            
            if (creditScore >= minScore && creditScore <= maxScore) {
                matchingOffers.add(offer);
            }
        }
        
        return matchingOffers;
    }
}

/**
 * Credit Card Offer model class
 */
class CreditCardOffer {
    private Long id;
    private String cardName;
    private String offerId;
    private String creditScoreRange;
    private List<String> purchaseCategories;
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCardName() { return cardName; }
    public void setCardName(String cardName) { this.cardName = cardName; }
    
    public String getOfferId() { return offerId; }
    public void setOfferId(String offerId) { this.offerId = offerId; }
    
    public String getCreditScoreRange() { return creditScoreRange; }
    public void setCreditScoreRange(String creditScoreRange) { this.creditScoreRange = creditScoreRange; }
    
    public List<String> getPurchaseCategories() { return purchaseCategories; }
    public void setPurchaseCategories(List<String> purchaseCategories) { this.purchaseCategories = purchaseCategories; }
}

/**
 * Repository interface for CreditCardOffer objects
 */
interface CreditCardOfferRepository {
    CreditCardOffer save(CreditCardOffer offer);
    List<CreditCardOffer> findAll();
}