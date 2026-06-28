import { query } from "../db/index.js";

// ============ TUPLE WRITES ============

// ek relation tuple (graph edge) likho — idempotent (UNIQUE constraint)
//   object_type:object_id  #relation  @subject_type:subject_id
export const writeTuple = async (
    objectType, objectId, relation, subjectType, subjectId
) => {
    const result = await query(
        `INSERT INTO relation_tuples
            (object_type, object_id, relation, subject_type, subject_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [objectType, objectId, relation, subjectType, subjectId]
    );
    return result.rowCount;
};

// ============ TUPLE READS (check engine ke building blocks) ============

// direct edge exist karta hai? object#relation@subject
const hasDirectTuple = async (
    objectType, objectId, relation, subjectType, subjectId
) => {
    const result = await query(
        `SELECT 1 FROM relation_tuples
         WHERE object_type = $1 AND object_id = $2 AND relation = $3
           AND subject_type = $4 AND subject_id = $5`,
        [objectType, objectId, relation, subjectType, subjectId]
    );
    return result.rowCount > 0;
};

// post ka parent folder id nikaalo (post#parent@folder edge)
const getParentFolderId = async (postId) => {
    const result = await query(
        `SELECT subject_id FROM relation_tuples
         WHERE object_type = 'post' AND object_id = $1
           AND relation = 'parent' AND subject_type = 'folder'`,
        [postId]
    );
    return result.rows[0]?.subject_id ?? null;
};

// powerful relation kamzor ko imply karta hai: owner ⊃ editor ⊃ viewer
// "is relation ko satisfy karne ke liye konsa stronger relation kaafi hai?"
const STRONGER_RELATION = {
    viewer: "editor",
    editor: "owner",
};

// ============ THE CHECK ENGINE (ReBAC ka dimaag) ============
// "Kya user U ka (objectType:objectId) pe `relation` hai?" — recursive graph walk
export const check = async (objectType, objectId, relation, userId) => {
    // 1) direct tuple — object#relation@user:U
    if (await hasDirectTuple(objectType, objectId, relation, "user", userId)) {
        return true;
    }

    // 2) implication — stronger relation bhi is relation ko satisfy karta hai
    //    (same object pe recurse: viewer -> editor -> owner)
    const stronger = STRONGER_RELATION[relation];
    if (stronger && (await check(objectType, objectId, stronger, userId))) {
        return true;
    }

    // 3) parent inheritance — post apne folder se SAME relation inherit karta hai
    if (objectType === "post") {
        const parentFolderId = await getParentFolderId(objectId);
        if (parentFolderId && (await check("folder", parentFolderId, relation, userId))) {
            return true;
        }
    }

    // sab fail → deny by default ⭐
    return false;
};
