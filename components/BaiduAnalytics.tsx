const baiduAnalyticsScript = `
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?9e0cbce65058e42d6f5c7eef84806a46";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();
`;

export function BaiduAnalytics() {
  return (
    <script
      id="baidu-analytics"
      dangerouslySetInnerHTML={{ __html: baiduAnalyticsScript }}
    />
  );
}
