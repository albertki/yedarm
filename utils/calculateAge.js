module.exports = function calculateAge(birthday) {  // birthday is a date %>
    const date1 = new Date(birthday) 
    var ageDifMs = Date.now() - date1.getTime();
    var ageDate = new Date(ageDifMs);  // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}