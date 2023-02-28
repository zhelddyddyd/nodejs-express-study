module.exports = {
    isOwner: (req, res) => {
        if(req.user){
            return true;
        }else{
            return false;
        }
    },
    statusUI:function(req, res){ // arrow function은 this 를 동적으로 탐색하여, 정상동작 X
        let authStatusUI = '<a href="/auth/login">login</a>';
        if (this.isOwner(req, res)){
            authStatusUI = `${req.user.nickname} | <a href="/auth/logout">logout</a>`;
        }
        return authStatusUI;
    }
}