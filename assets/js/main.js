let currentQuery = null,
    currentOffset = 0,
    maxOffset = null,
    limit = 25;

function get(url) {
  return new Promise(function(resolve, reject) {
    const req =  new XMLHttpRequest();
    req.open('GET', url);
    req.onload = function(data){
      if (req.status == 200) {
        resolve(req.response);
      }
      else {
        reject(Error(req.statusText));
      }
    };
    req.onerror = function() {
      reject(Error("Network Error"));
    };
    req.send();
  });
}

function checkInput(event){
  if(event.currentTarget.value != ''){
    event.currentTarget.nextElementSibling.disabled = false;
  }
  else event.currentTarget.nextElementSibling.disabled = true;
}

function numPages(total, limit){
  return (total % limit === 0 ) ? total/limit : Math.floor(total/limit) + 1;
}

function cleanData(){
  document.getElementById('total-results').innerHTML = '';
  document.getElementById('current-page').innerHTML = '';
  document.getElementById('last-page').innerHTML = '';
  document.getElementById('results-body').innerHTML = '';
}

function anotherPage(direction){
  let offset = 0;
  if(direction === 'left' && currentOffset >= limit){
    offset = currentOffset-limit;
    getData(currentQuery, offset);
  }
  else if(direction === 'right' && currentOffset< maxOffset && currentQuery) {
    offset = currentOffset+limit;
    getData(currentQuery, offset);
  }
}

function searchQuery(){
  let query = document.getElementById('search-query').value;
  getData(query,0);
}

function getData(query,offset){
  currentQuery = query;
  currentOffset = offset;
  let url = 'https://api.twitch.tv/kraken/search/streams?q='+query+'&limit='+limit+'&offset='+offset+'&client_id=i48zh4a0zd87snq715g5wghbo1totg';
  let promiseData = get(url);
  promiseData.then(function(response){
    appendResponse(response);
  });
}

function appendResponse(response){
  let data = JSON.parse(response),
      pages = numPages(data._total, limit),
      currentPage = (currentOffset/limit)+1,
      nodeResult = null,
      resultHtml = null,
      totalResultsNode = document.createTextNode(data._total),
      totalPagesNode = document.createTextNode(pages),
      currentPageNode = document.createTextNode(currentPage);

  cleanData();
  maxOffset = pages*limit-limit;

  data.streams.forEach(function(element){
      nodeResult = document.createElement('li');
      nodeResult.className = "result-element";
      nodeResult.id =element._id;
      resultHtml =
              '<img src="'+element.preview.medium+'" alt="" >' +
              '<div class="element-info">'+
                '<div class="element-info-title">'+element.channel.name+'</div>'+
                '<div class="element-info-data">'+
                  '<div>'+element.game+' - '+element.viewers+' viewers</div>'+
                  '<div class="element-info-description">'+element.channel.status+'</div>'+
                '</div>'+
              '</div>';

    nodeResult.innerHTML = resultHtml;
    document.getElementById('total-results').appendChild(totalResultsNode);
    document.getElementById('current-page').appendChild(currentPageNode);
    document.getElementById('last-page').appendChild(totalPagesNode);
    document.getElementById('results-body').appendChild(nodeResult);
  });
}
