module.exports = {
    isOwner: (req, res) => {
        if(req.user){
            return true;
        }else{
            return false;
        }
    },
    statusUI:function(req, res){
        let authStatusUI = '<a href="/auth/login">login</a>';
        console.log("dgfa");
        console.log(this);
        console.log("end");
        if (this.isOwner(req, res)){
            authStatusUI = `${req.user.nickname} | <a href="/auth/logout">logout</a>`;;
        }
        return authStatusUI;
    }
}