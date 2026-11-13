---
layout: academic
permalink: /
title: "Yu Zhao"
excerpt: "Research in reinforcement learning, wireless networks, and the Internet of Things."
redirect_from:
  - /about/
  - /about.html
---

<header class="academic-intro home-intro">
  <h1>Yu Zhao <span lang="zh">赵宇</span></h1>
  <p class="academic-deck">Reinforcement learning for wireless networks</p>
  <p>I am with the College of Artificial Intelligence at Tianjin University of Science and Technology. My research focuses on how learning algorithms can help wireless networks make decisions about channel access, scheduling, and resource allocation.</p>
  <div class="academic-actions">
    <a class="academic-button primary" href="{{ '/research/' | relative_url }}">Explore my research <span aria-hidden="true">→</span></a>
    <a class="academic-button" href="{{ '/publications/' | relative_url }}">Publications</a>
  </div>
</header>

<section class="news-section" aria-labelledby="news-heading">
  <h2 id="news-heading"><i class="fas fa-bolt" aria-hidden="true"></i> News</h2>
  {% assign news = site.data.news %}
  {% for entry in site.data.news_entries %}
    {% assign news = news | push: entry[1] %}
  {% endfor %}
  {% assign news = news | sort: 'date' | reverse %}
  {% if news.size > 0 %}
    <ul class="news-list">
      {% for item in news %}
        {% case item.type %}
          {% when 'acceptance' %}{% assign icon = 'fa-check-circle' %}{% assign label = 'Paper accepted' %}
          {% when 'publication' %}{% assign icon = 'fa-book-open' %}{% assign label = 'Publication' %}
          {% when 'talk' %}{% assign icon = 'fa-microphone' %}{% assign label = 'Talk' %}
          {% when 'award' %}{% assign icon = 'fa-trophy' %}{% assign label = 'Award' %}
          {% else %}{% assign icon = 'fa-bullhorn' %}{% assign label = 'Announcement' %}
        {% endcase %}
        <li class="news-item" data-type="{{ item.type | escape }}">
          <span class="news-icon" aria-hidden="true"><i class="fas {{ icon }}"></i></span>
          <div class="news-item-body">
            <div class="news-meta">
              <span>{{ label }}</span>
              <time datetime="{{ item.date | date: '%Y-%m-%d' }}">{{ item.date | date: '%b %-d, %Y' }}</time>
            </div>
            {% if item.title %}<h3>{{ item.title | escape }}</h3>{% endif %}
            <p>{{ item.text | escape | newline_to_br }}</p>
            {% if item.url %}<a class="news-link" href="{{ item.url | escape }}">{{ item.link_label | default: 'Read more' | escape }} <span aria-hidden="true">↗</span></a>{% endif %}
          </div>
        </li>
      {% endfor %}
    </ul>
  {% else %}
    <p class="news-empty">No news yet.</p>
  {% endif %}
</section>
