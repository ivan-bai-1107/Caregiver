import { useNavigate } from "react-router";
import { Users, FileText, MessageSquare, TrendingUp, Clock, Eye, ArrowUpRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export function AdminDashboardPage() {
  const navigate = useNavigate();

  const stats = [
    { label: "总用户数", value: "1,234", change: "+12.5%", icon: Users, bgColor: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "知识文章", value: "156", change: "+8 本周", icon: FileText, bgColor: "bg-green-50", iconColor: "text-green-600" },
    { label: "社区帖子", value: "892", change: "+23 本周", icon: MessageSquare, bgColor: "bg-purple-50", iconColor: "text-purple-600" },
    { label: "今日活跃", value: "468", change: "+15.2%", icon: TrendingUp, bgColor: "bg-orange-50", iconColor: "text-orange-600" },
  ];

  const pendingReviews = [
    { id: 1, type: "知识文章", title: "老年痴呆症早期识别与护理", author: "李医生", time: "2小时前" },
    { id: 2, type: "社区帖子", title: "护理老人的心理健康经验分享", author: "护理员小王", time: "3小时前" },
    { id: 3, type: "知识文章", title: "糖尿病足部护理完全指南", author: "张护士", time: "5小时前" },
  ];

  const chartData = [
    { date: "04-08", users: 420, posts: 12 },
    { date: "04-09", users: 445, posts: 15 },
    { date: "04-10", users: 438, posts: 18 },
    { date: "04-11", users: 462, posts: 14 },
    { date: "04-12", users: 478, posts: 20 },
    { date: "04-13", users: 485, posts: 16 },
    { date: "04-14", users: 468, posts: 23 },
  ];

  const categoryData = [
    { id: "cat-1", name: "慢病管理", count: 45 },
    { id: "cat-2", name: "饮食护理", count: 32 },
    { id: "cat-3", name: "康复训练", count: 28 },
    { id: "cat-4", name: "症状处理", count: 21 },
    { id: "cat-5", name: "用药指导", count: 18 },
    { id: "cat-6", name: "经验分享", count: 12 },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-gray-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          仪表盘
        </h1>
        <p className="text-gray-500">欢迎回来，管理员。以下是今日系统概况。</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* User Trend Chart */}
        <div className="col-span-2 bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>用户活跃趋势</h2>
            <span className="text-sm text-gray-500">最近7天</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#999' }} stroke="#f0f0f0" />
                <YAxis tick={{ fontSize: 12, fill: '#999' }} stroke="#f0f0f0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '13px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Line type="monotone" dataKey="users" stroke="#5B8A72" strokeWidth={2.5} dot={{ fill: '#5B8A72', r: 4 }} name="活跃用户" />
                <Line type="monotone" dataKey="posts" stroke="#8B5CF6" strokeWidth={2.5} dot={{ fill: '#8B5CF6', r: 4 }} name="新增帖子" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-gray-900 mb-6" style={{ fontFamily: 'var(--font-display)' }}>内容分类分布</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12, fill: '#999' }} stroke="#f0f0f0" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#666' }} stroke="#f0f0f0" width={70} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="count" fill="#5B8A72" radius={[0, 6, 6, 0]} name="文章数" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending Reviews */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>待审核内容</h2>
            <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
              {pendingReviews.length} 条待处理
            </span>
          </div>
          <button
            onClick={() => navigate("/admin/reviews")}
            className="text-sm text-primary hover:underline"
          >
            查看全部 →
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 text-sm text-gray-500 font-normal">类型</th>
              <th className="text-left py-3 text-sm text-gray-500 font-normal">标题</th>
              <th className="text-left py-3 text-sm text-gray-500 font-normal">提交者</th>
              <th className="text-left py-3 text-sm text-gray-500 font-normal">时间</th>
              <th className="text-right py-3 text-sm text-gray-500 font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            {pendingReviews.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-4">
                  <span className={`px-2.5 py-1 text-xs rounded-lg ${
                    item.type === "知识文章" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="py-4 text-sm text-gray-900">{item.title}</td>
                <td className="py-4 text-sm text-gray-500">{item.author}</td>
                <td className="py-4 text-sm text-gray-400">{item.time}</td>
                <td className="py-4 text-right">
                  <button
                    onClick={() => navigate("/admin/reviews")}
                    className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    去审核
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}