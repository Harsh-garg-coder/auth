// ============ ABAC POLICY ENGINE ============
// Har policy ek pure function hai jo attributes pe decision deti hai:
//   (subject, resource, environment) => { allow: boolean, reason: string }
// Roles/permissions nahi — sirf ATTRIBUTES.

const OFFICE_START = 9;   // 9 AM
const OFFICE_END = 18;    // 6 PM

const policies = {
    "post:update": (user, post, env) => {
        // Rule 1 — OWNER: apni post hamesha edit kar sakta hai (kisi bhi status/dept/time)
        if (post.user_id === user.id) {
            return { allow: true, reason: "owner" };
        }

        // Rule 2 — TEAMMATE: same department ka banda DRAFT post ko OFFICE HOURS me edit kar sakta hai
        const sameDept = Boolean(user.department) && user.department === post.department;  // subject + resource attr
        const isDraft = post.status === "draft";                                           // resource attr
        const officeHours = env.hour >= OFFICE_START && env.hour < OFFICE_END;             // environment attr

        if (sameDept && isDraft && officeHours) {
            return { allow: true, reason: "same-dept teammate, draft, office-hours" };
        }

        return {
            allow: false,
            reason: `denied → sameDept=${sameDept}, draft=${isDraft}, officeHours=${officeHours}`,
        };
    },

    "post:delete": (user, post, env) => {
        // delete sirf owner — simpler policy
        if (post.user_id === user.id) {
            return { allow: true, reason: "owner" };
        }
        return { allow: false, reason: "only owner can delete" };
    },
};

// central evaluation point — ek hi jagah se saare authz decisions
export const can = (action, user, post, env) => {
    const policy = policies[action];

    // ⭐ DENY BY DEFAULT — action ke liye koi policy nahi to access NAHI
    if (!policy) {
        return { allow: false, reason: `no policy defined for '${action}'` };
    }

    return policy(user, post, env);
};
