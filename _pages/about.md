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

<section class="academic-section" aria-labelledby="news-heading">
  <h2 id="news-heading">News</h2>
  {% assign news = site.data.news | sort: 'date' | reverse %}
  {% if news.size > 0 %}
    <ul class="news-list">
      {% for item in news %}
        {% case item.type %}
          {% when 'acceptance' %}{% assign icon = 'fa-file-alt' %}{% assign tone = 'green' %}
          {% when 'publication' %}{% assign icon = 'fa-book-open' %}{% assign tone = 'green' %}
          {% when 'talk' %}{% assign icon = 'fa-microphone' %}{% assign tone = 'blue' %}
          {% when 'award' %}{% assign icon = 'fa-trophy' %}{% assign tone = 'gold' %}
          {% else %}{% assign icon = 'fa-bullhorn' %}{% assign tone = 'neutral' %}
        {% endcase %}
        <li class="news-item">
          <span class="news-icon news-icon--{{ tone }}" aria-hidden="true"><i class="fas {{ icon }}"></i></span>
          <div class="news-item-body">
            <time datetime="{{ item.date | date: '%Y-%m-%d' }}">{{ item.date | date: '%b %d, %Y' }}</time>
            <p>{{ item.text | escape }}{% if item.url %} <a href="{{ item.url | escape }}">{{ item.link_label | default: 'Read more' | escape }} <span aria-hidden="true">↗</span></a>{% endif %}</p>
          </div>
        </li>
      {% endfor %}
    </ul>
  {% else %}
    <p class="news-empty">No news yet.</p>
  {% endif %}
</section>
