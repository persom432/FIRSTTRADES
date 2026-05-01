// GitHub-backed shared data store
// Deposits are stored in deposits.json in the repo — readable by admin from any device
var GH_REPO  = 'persom432/firsttrades';
var GH_FILE  = 'deposits.json';
var GH_TOKEN = 'PASTE_YOUR_GITHUB_TOKEN_HERE';
var GH_API   = 'https://api.github.com/repos/' + GH_REPO + '/contents/' + GH_FILE;

function ghGetDeposits(callback) {
    fetch(GH_API + '?t=' + Date.now(), {
        headers: { 'Authorization': 'token ' + GH_TOKEN, 'Accept': 'application/vnd.github.v3+json' }
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        var content = data.content ? atob(data.content.replace(/\n/g,'')) : '[]';
        var deposits = JSON.parse(content);
        callback(null, deposits, data.sha);
    })
    .catch(function(e) { callback(e, [], null); });
}

function ghSaveDeposits(deposits, sha, callback) {
    var body = { message: 'Update deposits', content: btoa(JSON.stringify(deposits, null, 2)) };
    if (sha) body.sha = sha;
    fetch(GH_API, {
        method: 'PUT',
        headers: { 'Authorization': 'token ' + GH_TOKEN, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(function() { if (callback) callback(null); })
    .catch(function(e) { if (callback) callback(e); });
}

function ghAddDeposit(deposit, callback) {
    ghGetDeposits(function(err, deposits, sha) {
        deposits.push(deposit);
        ghSaveDeposits(deposits, sha, callback);
    });
}

function ghUpdateDeposit(id, updates, callback) {
    ghGetDeposits(function(err, deposits, sha) {
        var idx = deposits.findIndex(function(d) { return d.id === id; });
        if (idx >= 0) Object.assign(deposits[idx], updates);
        ghSaveDeposits(deposits, sha, callback);
    });
}
