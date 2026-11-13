---
layout: academic
permalink: /
title: "Yu Zhao"
excerpt: "Research in reinforcement learning, wireless networks, and the Internet of Things."
redirect_from:
  - /about/
  - /about.html
---

<header class="academic-intro">
  <h1>Yu Zhao <span lang="zh">赵宇</span></h1>
  <p class="academic-deck">Reinforcement learning for wireless networks</p>
  <p>I am with the College of Artificial Intelligence at Tianjin University of Science and Technology. My research focuses on how learning algorithms can help wireless networks make decisions about channel access, scheduling, and resource allocation.</p>
  <div class="academic-actions">
    <a class="academic-button primary" href="{{ '/publications/' | relative_url }}">View publications <span aria-hidden="true">→</span></a>
    <a class="academic-button" href="{{ '/cv/' | relative_url }}">Curriculum vitae</a>
  </div>
</header>

<section class="academic-section" aria-labelledby="research-heading">
  <h2 id="research-heading">Research interests</h2>
  <ul class="academic-topics">
    <li>Reinforcement learning</li>
    <li>Wireless networks and IoT</li>
    <li>Random access and scheduling</li>
    <li>Multi-armed bandits</li>
  </ul>
</section>

<section class="academic-section" aria-labelledby="latest-heading">
  <div class="academic-section-head">
    <h2 id="latest-heading">Recent publications</h2>
    <a href="{{ '/publications/' | relative_url }}">All publications <span aria-hidden="true">→</span></a>
  </div>
  {% assign papers = site.publications | sort: 'date' | reverse %}
  {% for paper in papers limit: 3 %}
    {% include academic-paper.html paper=paper compact=true show_year=true %}
  {% endfor %}
</section>
