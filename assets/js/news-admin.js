(() => {
  const templates = {
    journal: ["期刊论文", ["论文标题", "期刊名称", "进展（如 accepted for publication）"], ([paper, venue, stage]) =>
      [`Journal update · ${venue}`, `Our paper “${paper}” has been ${stage} in ${venue}.`]],
    conference: ["会议论文", ["论文标题", "会议名称", "进展（如 accepted for presentation）"], ([paper, venue, stage]) =>
      [`Conference update · ${venue}`, `Our paper “${paper}” has been ${stage} at ${venue}.`]],
    funding: ["科研基金", ["项目名称", "资助机构", "基金计划或编号（可选）"], ([project, funder, program]) =>
      [`Funding awarded · ${project}`, `Our project “${project}” received funding from ${funder}${program ? ` under ${program}` : ""}.`]],
    preprint: ["预印本", ["论文标题", "平台"], ([paper, platform]) =>
      ["New preprint", `Our preprint “${paper}” is available on ${platform}.`]],
    talk: ["报告与邀请", ["报告题目", "活动或主办单位", "时间或地点（可选）"], ([title, event, location]) =>
      [`Talk · ${event}`, `I will present “${title}” at ${event}${location ? ` (${location})` : ""}.`]],
    award: ["获奖与荣誉", ["奖项名称", "授奖机构", "获奖者"], ([award, organization, recipient]) =>
      [award, `${recipient} received the ${award} from ${organization}.`]],
    service: ["学术服务", ["职务或职责", "期刊、会议或组织"], ([role, organization]) =>
      [`Academic service · ${organization}`, `I am serving as ${role} for ${organization}.`]],
    collaboration: ["研究合作", ["合作单位或团队", "合作主题"], ([partner, topic]) =>
      [`New collaboration · ${partner}`, `We are starting a collaboration with ${partner} on ${topic}.`]],
    release: ["代码与数据发布", ["资源名称", "资源内容或用途"], ([name, purpose]) =>
      [`New release · ${name}`, `We released ${name}. ${purpose}`]],
    team: ["团队与招生", ["成员或岗位", "动态（如招募方向、加入时间）"], ([name, update]) =>
      [`Team update · ${name}`, update]],
    teaching: ["教学", ["课程或活动名称", "教学动态"], ([course, update]) =>
      [`Teaching · ${course}`, update]],
    general: ["其他公告", ["标题", "正文"], ([title, text]) => [title, text]],
  };

  const ownerId = 48511071;
  const api = "https://api.github.com";
  const repo = "/repos/zhaoyuchinese/zhaoyuchinese.github.io";
  const workflow = "/actions/workflows/publish-news.yml";
  const workflowUrl = "https://github.com/zhaoyuchinese/zhaoyuchinese.github.io/actions/workflows/publish-news.yml";
  const dialog = document.getElementById("news-editor");
  const login = document.getElementById("news-admin-login");
  const compose = document.getElementById("news-admin-compose");
  const actions = document.getElementById("news-admin-actions");
  const fields = document.getElementById("news-template-fields");
  const status = document.getElementById("news-editor-status");
  const runLink = document.getElementById("news-run-link");
  const templateStep = document.getElementById("news-template-step");
  const reviewStep = document.getElementById("news-review-step");
  const { category, details, headline, body, date, url } = compose.elements;
  let token;

  async function request(path, credential, payload) {
    const response = await fetch(api + path, {
      method: payload ? "POST" : "GET",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${credential}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(payload && { "Content-Type": "application/json" }),
      },
      ...(payload && { body: JSON.stringify(payload) }),
      cache: "no-store",
    });
    if (response.status === 401) throw new Error("GitHub 令牌无效或已过期，请重新验证。");
    if (response.status === 403 || response.status === 404) {
      throw new Error("GitHub 拒绝了操作。请检查令牌是否选中了本站仓库，并具有 Actions 读写权限。");
    }
    if (!response.ok) throw new Error(`GitHub 返回错误 ${response.status}，请检查表单或稍后重试。`);
    return response.status === 204 ? null : response.json();
  }

  function showReview(review) {
    templateStep.hidden = review;
    reviewStep.hidden = !review;
    headline.disabled = !review;
    body.disabled = !review;
    status.textContent = "";
    if (review) headline.focus();
    else category.focus();
  }

  for (const [key, [label]] of Object.entries(templates)) {
    category.add(new Option(label, key));
  }
  function renderFields() {
    const [, labels] = templates[category.value];
    fields.replaceChildren();
    for (const name of labels) {
      const label = document.createElement("label");
      label.textContent = name;
      const input = name === "正文" ? document.createElement("textarea") : document.createElement("input");
      input.required = !name.endsWith("（可选）");
      input.maxLength = name === "正文" ? 3000 : 240;
      label.append(input);
      fields.append(label);
    }
  }
  category.addEventListener("change", renderFields);
  renderFields();

  function openEditor() {
    login.hidden = Boolean(token);
    compose.hidden = !token;
    status.textContent = "";
    if (!dialog.open) dialog.showModal();
  }

  function openFromAddress() {
    if (location.hash !== "#news-admin") return;
    history.replaceState(null, "", location.pathname + location.search + "#news-heading");
    openEditor();
  }
  window.addEventListener("hashchange", openFromAddress);
  openFromAddress();

  login.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.submitter;
    const credential = login.elements.token.value.trim();
    login.reset();
    button.disabled = true;
    status.textContent = "正在验证 GitHub 身份…";
    try {
      const [user, repository] = await Promise.all([
        request("/user", credential),
        request(repo, credential),
      ]);
      if (user.id !== ownerId || !repository.permissions?.admin) {
        throw new Error("当前 GitHub 账号无权管理本站新闻。");
      }
      token = credential;
      const create = document.createElement("button");
      create.type = "button";
      create.className = "news-editor-primary";
      create.textContent = "＋ 发布新闻";
      create.addEventListener("click", openEditor);
      actions.replaceChildren(create);
      actions.hidden = false;
      openEditor();
      showReview(false);
    } catch (error) {
      status.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });

  document.getElementById("news-preview-button").addEventListener("click", () => {
    const controls = [...fields.querySelectorAll("input, textarea")];
    if (![...controls, url, date].every((control) => control.reportValidity())) return;
    if (url.value && !url.value.startsWith("https://")) {
      status.textContent = "相关链接请使用 HTTPS。";
      return;
    }
    const values = controls.map((control) => control.value.trim());
    if (controls.some((control, index) => control.required && !values[index])) {
      status.textContent = "请填写所有必填字段。";
      return;
    }
    const [, , format] = templates[category.value];
    const [title, text] = format(values);
    headline.value = title;
    body.value = [text, details.value.trim()].filter(Boolean).join("\n\n");
    showReview(true);
  });
  document.getElementById("news-edit-button").addEventListener("click", () => showReview(false));

  compose.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!token || reviewStep.hidden) return;
    const button = event.submitter;
    button.disabled = true;
    runLink.hidden = true;
    status.textContent = "正在提交…";
    try {
      const result = await request(repo + workflow + "/dispatches", token, {
        ref: "master",
        inputs: {
          title: headline.value.trim(),
          text: body.value.trim(),
          category: category.value,
          date: date.value,
          url: url.value,
        },
      });
      runLink.href = Number.isSafeInteger(result?.workflow_run_id)
        ? `https://github.com/zhaoyuchinese/zhaoyuchinese.github.io/actions/runs/${result.workflow_run_id}`
        : workflowUrl;
      runLink.hidden = false;
      compose.reset();
      renderFields();
      showReview(false);
      status.textContent = "新闻已提交。GitHub 部署完成后会显示在首页。";
    } catch (error) {
      status.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });
})();
