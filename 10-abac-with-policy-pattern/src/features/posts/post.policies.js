export const PostPolicies = {
    create: (user, post, context) => {
        if(!user.permissions.includes("post:create")) {
            return false;
        }

        if(user.is_premium) {
            return true;
        }

        if(context.userPostCount < 5) {
            return true;
        } 

        return false;
    },
    readAll: (user, post) => user.permissions.includes("post:read:any"),
    read: (user, post) => {
        if(!user.permissions.includes("post:read:any")) {
            return false;
        }
        
        if(post.status === 'published') {
            return true;
        }

        if(post.status === 'draft' && post.user_id === user.id) {
            return true;
        }

        return false;
    },
    update: (user, post) => {
        if(
            !user.permissions.includes("post:update:any") && 
            !user.permissions.includes("post:update:own")
        ) {
            return false;
        }

        if(post.status === 'draft') {
            if(post.user_id === user.id) {
                return true;
            } 
        } else {
            if(post.user_id === user.id) {
                return true;
            } 

            if(user.permissions.includes("post:update:any")) {
                return true;
            }
        }

        return false;
    },
    delete: (user, post) => {
        if(
            !user.permissions.includes("post:delete:any") && 
            !user.permissions.includes("post:delete:own")
        ) {
            return false;
        }

        if(post.status === 'draft') {
            if(post.user_id === user.id) {
                return true;
            } 
        } else {
            if(post.user_id === user.id) {
                return true;
            } 

            if(user.permissions.includes("post:delete:any")) {
                return true;
            }
        }
        
        return false;
    }
}