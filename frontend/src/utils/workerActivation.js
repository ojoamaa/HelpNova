const COMPLETE_VALUES = new Set([
    "verified",
    "approved",
    "complete",
    "completed",
    "submitted",
    "active",
    "matched",
    "available",
    "available now",
    "yes",
    "true",
]);

const EMPTY_VALUES = new Set([
    "",
    "not provided",
    "not available",
    "none",
    "null",
    "undefined",
    "not_submitted",
    "not submitted",
]);

function normalized(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase();
}

function hasText(value) {
    const text = normalized(value);

    return Boolean(
        text &&
        !EMPTY_VALUES.has(text)
    );
}

function isComplete(value) {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "number") {
        return value > 0;
    }

    return COMPLETE_VALUES.has(
        normalized(value)
    );
}

function isApproved(value) {
    return normalized(value) === "approved";
}

function hasSkills(worker = {}) {
    if (Array.isArray(worker.skills)) {
        return worker.skills.length > 0;
    }

    return (
        hasText(worker.profession) ||
        hasText(worker.service_category) ||
        hasText(worker.serviceCategory)
    );
}

function hasApprovedGuarantor(worker = {}) {
    const guarantors =
        Array.isArray(worker.guarantors)
            ? worker.guarantors
            : Array.isArray(worker.guarantor_records)
                ? worker.guarantor_records
                : [];

    return guarantors.some((guarantor) =>
        isApproved(guarantor?.status) ||
        isApproved(guarantor?.verification_status) ||
        isApproved(guarantor?.verificationStatus)
    );
}

export function getWorkerActivation(worker = {}) {
    const checks = [
        {
            key: "profile",
            label: "Personal profile",
            weight: 15,
            unlocks: [
                "Customer visibility",
                "Basic residential job matching",
            ],
            complete:
                hasText(
                    worker.full_name ||
                    worker.fullName ||
                    worker.name
                ) &&
                hasText(
                    worker.phone_number ||
                    worker.phoneNumber ||
                    worker.phone
                ) &&
                hasText(worker.email),
            action:
                "Complete your personal and contact information",
        },

        {
            key: "skills",
            label: "Skills and profession",
            weight: 15,
            unlocks: [
                "Skill-matched requests",
                "Relevant service-category opportunities",
            ],
            complete: hasSkills(worker),
            action:
                "Add your profession and service skills",
        },

        {
            key: "phone",
            label: "Phone verification",
            weight: 10,
            unlocks: [
                "Job alerts",
                "Customer and support contact",
            ],
            complete:
                isComplete(worker.phone_verified) ||
                isComplete(worker.phoneVerified) ||
                isComplete(
                    worker.phone_verification_status
                ) ||
                isComplete(
                    worker.phoneVerificationStatus
                ) ||
                hasText(
                    worker.phone_number ||
                    worker.phoneNumber ||
                    worker.phone
                ),
            action:
                "Verify your phone number",
        },

        {
            key: "identity",
            label: "Identity verification",
            weight: 15,
            unlocks: [
                "Standard verified jobs",
                "Improved customer trust badge",
            ],
            complete:
                isComplete(worker.nin_status) ||
                isComplete(worker.ninStatus) ||
                isComplete(worker.identity_status) ||
                isComplete(worker.identityStatus) ||
                isComplete(
                    worker.identity_verification_status
                ) ||
                isComplete(
                    worker.identityVerificationStatus
                ) ||
                isComplete(worker.verification_status) ||
                isComplete(worker.verificationStatus),
            action:
                "Submit a valid identity document",
        },

        {
            key: "guarantor",
            label: "Guarantor verification",
            weight: 15,
            unlocks: [
                "Estate and household jobs",
                "Long-term service opportunities",
            ],
            complete:
                worker.guarantor_approved === true ||
                worker.guarantorApproved === true ||
                isApproved(worker.guarantor_status) ||
                isApproved(worker.guarantorStatus) ||
                isApproved(worker.guarantor_verification_status) ||
                isApproved(worker.guarantorVerificationStatus) ||
                hasApprovedGuarantor(worker),
            action:
                "Invite and verify a primary guarantor",
        },

        {
            key: "address",
            label: "Address verification",
            weight: 10,
            unlocks: [
                "Local-area dispatch",
                "Higher confidence matching",
            ],
            complete:
                isComplete(worker.address_status) ||
                isComplete(worker.addressStatus) ||
                isComplete(
                    worker.address_verification_status
                ) ||
                isComplete(
                    worker.addressVerificationStatus
                ) ||
                hasText(worker.address) ||
                hasText(worker.location) ||
                (
                    hasText(worker.area) &&
                    hasText(worker.city) &&
                    hasText(worker.state)
                ),
            action:
                "Submit proof of address",
        },

        {
            key: "documents",
            label: "Supporting documents",
            weight: 10,
            unlocks: [
                "Professional clients",
                "Corporate and higher-value requests",
            ],
            complete:
                isComplete(worker.documents_status) ||
                isComplete(worker.documentsStatus) ||
                isComplete(
                    worker.supporting_documents_status
                ) ||
                isComplete(
                    worker.supportingDocumentsStatus
                ) ||
                (
                    Array.isArray(worker.documents) &&
                    worker.documents.length > 0
                ),
            action:
                "Upload the required supporting documents",
        },

        {
            key: "wallet",
            label: "Wallet and payout setup",
            weight: 10,
            unlocks: [
                "Wallet settlement",
                "Withdrawal eligibility",
            ],
            complete:
                isComplete(worker.wallet_status) ||
                isComplete(worker.walletStatus) ||
                isComplete(worker.bank_status) ||
                isComplete(worker.bankStatus) ||
                Boolean(
                    worker.wallet_id ||
                    worker.walletId
                ) ||
                Boolean(
                    worker.bank_account_number ||
                    worker.bankAccountNumber
                ) ||
                Number(
                    worker.wallet_balance ??
                    worker.walletBalance ??
                    0
                ) > 0,
            action:
                "Complete wallet and payout setup",
        },
    ];

    const score = checks.reduce(
        (total, check) => {
            return total + (
                check.complete
                    ? check.weight
                    : 0
            );
        },
        0
    );

    const pending = checks.filter(
        (check) => !check.complete
    );

    const completed =
        checks.length - pending.length;

    const completedWeight = score;
    const totalWeight = checks.reduce(
        (total, check) =>
            total + check.weight,
        0
    );

    /*
     * Profile completion uses the same weighted activation
     * checks because the current admin interface treats
     * verification readiness as profile completion.
     */
    const profileCompletion = Math.round(
        totalWeight > 0
            ? (
                completedWeight /
                totalWeight
            ) * 100
            : 0
    );

    /*
     * Trust Score is deliberately separate from activation/profile
     * completion. For Sprint 2.1, an approved primary guarantor
     * contributes the defined 15 trust points. Other trust controls
     * (identity depth, background checks, ratings, completed jobs and
     * dispute history) can be added independently without changing the
     * activation percentage.
     */
    const guarantorCheck = checks.find(
        (check) => check.key === "guarantor"
    );

    const trustScore = Math.min(
        100,
        guarantorCheck?.complete
            ? guarantorCheck.weight
            : 0
    );

    let level = "Registered";
    let badge = "Bronze";

    let opportunity =
        "Eligible for selected low-risk jobs while building trust.";

    let maxOpportunity =
        "Limited matching priority";

    if (score >= 90) {
        level = "Elite Worker";
        badge = "Platinum";

        opportunity =
            "Eligible for premium, emergency and enterprise opportunities.";

        maxOpportunity =
            "Highest matching priority";
    } else if (score >= 70) {
        level = "Trusted Professional";
        badge = "Gold";

        opportunity =
            "Eligible for higher-value, corporate and priority opportunities.";

        maxOpportunity =
            "High matching priority";
    } else if (score >= 45) {
        level = "Verified Worker";
        badge = "Silver";

        opportunity =
            "Eligible for standard jobs with improving matching priority.";

        maxOpportunity =
            "Standard matching priority";
    }

    const nextStep =
        pending[0]?.action ||
        "Activation complete";

    const priority =
        score >= 90
            ? {
                label: "Highest",
                stars: 5,
            }
            : score >= 70
                ? {
                    label: "High",
                    stars: 4,
                }
                : score >= 45
                    ? {
                        label: "Standard",
                        stars: 3,
                    }
                    : score >= 25
                        ? {
                            label: "Developing",
                            stars: 2,
                        }
                        : {
                            label: "Limited",
                            stars: 1,
                        };

    const rewardTier =
        score >= 100
            ? "Verified Professional"
            : score >= 75
                ? "Gold Worker"
                : score >= 50
                    ? "Silver Worker"
                    : "Bronze Worker";

    const riskReasons = pending
        .slice(0, 3)
        .map((check) => check.label);

    const riskLevel =
        score >= 70
            ? "LOW"
            : score >= 45
                ? "MODERATE"
                : "RESTRICTED";

    const recommendedJobs =
        score >= 70
            ? [
                "Standard residential services",
                "Professional and higher-value requests",
                "Priority local dispatch",
            ]
            : score >= 45
                ? [
                    "Standard low-to-medium risk services",
                    "Nearby skill-matched jobs",
                    "Supervised recurring services",
                ]
                : [
                    "Selected low-risk residential jobs",
                    "Entry-level skill-matched requests",
                    "Jobs with additional admin oversight",
                ];

    const guarantorPending = pending.some(
        (check) =>
            check.key === "guarantor"
    );

    const restrictedJobs =
        guarantorPending
            ? [
                "Childcare and vulnerable-person care",
                "Unsupervised long-term household placements",
                "Sensitive estate assignments",
            ]
            : score < 70
                ? [
                    "Emergency response",
                    "High-value corporate contracts",
                    "Sensitive household placements",
                ]
                : [];

    return {
        /*
         * Core weighted result.
         */
        score,

        /*
         * Explicit aliases required by WorkerManagement.jsx.
         * These prevent undefined values from displaying as 0%.
         */
        activationScore: score,
        activationPercentage: score,
        percentage: score,
        trustScore,
        trust_score: trustScore,
        profileCompletion,
        profile_completion: profileCompletion,

        level,
        badge,
        rewardTier,
        priority,
        opportunity,
        maxOpportunity,

        completed,
        total: checks.length,
        completedWeight,
        totalWeight,

        pending,
        checks,
        nextStep,

        riskLevel,
        riskReasons,
        recommendedJobs,
        restrictedJobs,

        isFullyActivated:
            score === totalWeight,

        canReceiveJobs:
            score >= 25,
    };
}