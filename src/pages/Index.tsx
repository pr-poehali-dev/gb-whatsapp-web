import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  email: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  is_verified: boolean;
  last_seen: string;
}

interface Story {
  id: number;
  user_id: number;
  image_url?: string;
  text: string;
  created_at: string;
  user?: User;
  views?: number;
  viewers?: User[];
}

export default function Index() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [editProfile, setEditProfile] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    email: '', 
    password: '', 
    username: '', 
    display_name: '' 
  });

  const [profileForm, setProfileForm] = useState({
    display_name: '',
    username: '',
    bio: '',
    avatar_url: ''
  });

  useEffect(() => {
    loadUsers();
    loadStories();
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setProfileForm({
          display_name: user.display_name,
          username: user.username,
          bio: user.bio,
          avatar_url: user.avatar_url
        });
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const loadUsers = async () => {
    const mockUsers: User[] = [
      {
        id: 1,
        email: 'admin@gbwhatsapps.ru',
        username: 'gbwhatsapps_official',
        display_name: 'GBWhatsApps',
        bio: 'Официальный аккаунт GBWhatsApps 🚀',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=official',
        is_verified: true,
        last_seen: new Date().toISOString()
      },
      {
        id: 2,
        email: 'anna@example.ru',
        username: 'anna_designer',
        display_name: 'Анна Иванова',
        bio: 'UI/UX дизайнер | Москва 🎨',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anna',
        is_verified: true,
        last_seen: new Date(Date.now() - 5 * 60000).toISOString()
      },
      {
        id: 3,
        email: 'dmitry@example.ru',
        username: 'dmitry_dev',
        display_name: 'Дмитрий Смирнов',
        bio: 'Full-stack разработчик 💻',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dmitry',
        is_verified: false,
        last_seen: new Date(Date.now() - 2 * 3600000).toISOString()
      },
      {
        id: 4,
        email: 'maria@example.ru',
        username: 'maria_photo',
        display_name: 'Мария Петрова',
        bio: 'Фотограф | Путешествия 📸',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
        is_verified: true,
        last_seen: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    setUsers(mockUsers);
  };

  const loadStories = async () => {
    const mockStories: Story[] = [
      {
        id: 1,
        user_id: 1,
        text: 'Новые функции уже скоро! 🎉',
        created_at: new Date().toISOString(),
        views: 234,
        viewers: []
      },
      {
        id: 2,
        user_id: 2,
        text: 'Работаю над новым дизайном ✨',
        created_at: new Date().toISOString(),
        views: 156,
        viewers: []
      },
      {
        id: 3,
        user_id: 3,
        text: 'Запустил новый проект! Кто хочет протестировать? 🚀',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        views: 89,
        viewers: []
      },
      {
        id: 4,
        user_id: 4,
        text: 'Сегодня отличная погода для фотосессии! ☀️📸',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        views: 142,
        viewers: []
      }
    ];
    setStories(mockStories);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users[0];
    setCurrentUser(user);
    setProfileForm({
      display_name: user.display_name,
      username: user.username,
      bio: user.bio,
      avatar_url: user.avatar_url
    });
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: users.length + 1,
      email: registerForm.email,
      username: registerForm.username,
      display_name: registerForm.display_name,
      bio: '',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerForm.username}`,
      is_verified: false,
      last_seen: new Date().toISOString()
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setProfileForm({
      display_name: newUser.display_name,
      username: newUser.username,
      bio: newUser.bio,
      avatar_url: newUser.avatar_url
    });
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const handleUpdateProfile = () => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...profileForm };
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      setEditProfile(false);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return `${Math.floor(hours / 24)} дн назад`;
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const storiesWithUsers = stories.map(story => ({
    ...story,
    user: users.find(u => u.id === story.user_id)
  }));

  if (!currentUser) {
    return (
      <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 animate-fade-in shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              GBWhatsApps
            </h1>
            <p className="text-muted-foreground">Общайся со всем миром</p>
          </div>

          <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(v) => setIsLogin(v === 'login')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.ru"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Пароль</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full gradient-primary text-white hover:opacity-90">
                  Войти
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="your@email.ru"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reg-username">Псевдоним</Label>
                  <Input
                    id="reg-username"
                    placeholder="username"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reg-name">Имя</Label>
                  <Input
                    id="reg-name"
                    placeholder="Ваше имя"
                    value={registerForm.display_name}
                    onChange={(e) => setRegisterForm({ ...registerForm, display_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reg-password">Пароль</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full gradient-primary text-white hover:opacity-90">
                  Зарегистрироваться
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            GBWhatsApps
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative max-w-md w-64">
              <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Поиск аккаунтов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Avatar className="hover-scale cursor-pointer" onClick={() => setActiveTab('profile')}>
              <AvatarImage src={currentUser.avatar_url} />
              <AvatarFallback>{currentUser.display_name[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <nav className="sticky top-[60px] z-40 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'feed', icon: 'Home', label: 'Лента' },
              { id: 'search', icon: 'Users', label: 'Поиск' },
              { id: 'stories', icon: 'Camera', label: 'Истории' },
              { id: 'notifications', icon: 'Bell', label: 'Уведомления' },
              { id: 'profile', icon: 'User', label: 'Профиль' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 transition-all ${
                  activeTab === tab.id
                    ? 'border-b-2 border-primary text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab.icon as any} size={20} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {activeTab === 'feed' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {storiesWithUsers.map((story) => story.user && (
                <div
                  key={story.id}
                  className="flex flex-col items-center gap-2 cursor-pointer hover-scale"
                  onClick={() => setSelectedStory(story)}
                >
                  <div className="p-1 rounded-full story-ring">
                    <Avatar className="h-16 w-16 border-4 border-white">
                      <AvatarImage src={story.user.avatar_url} />
                      <AvatarFallback>{story.user.display_name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-xs text-center max-w-[70px] truncate">
                    {story.user.username}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid gap-6">
              {storiesWithUsers.map((story) => story.user && (
                <Card key={story.id} className="overflow-hidden hover-scale">
                  <div className="p-4 flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={story.user.avatar_url} />
                      <AvatarFallback>{story.user.display_name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{story.user.display_name}</p>
                        {story.user.is_verified && (
                          <Icon name="BadgeCheck" className="text-green-500" size={16} />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">@{story.user.username}</p>
                    </div>
                  </div>
                  <div className="p-6 min-h-[200px] flex items-center justify-center gradient-primary">
                    <p className="text-white text-2xl font-bold text-center px-4">{story.text}</p>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Icon name="Heart" size={20} />
                        <span>Нравится</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Icon name="MessageCircle" size={20} />
                        <span>Комментировать</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Icon name="Share2" size={20} />
                        <span>Поделиться</span>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{getTimeAgo(story.created_at)}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-bold">Найти аккаунты</h2>
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="p-4 flex items-center gap-4 hover-scale">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.display_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{user.display_name}</p>
                      {user.is_verified && (
                        <Icon name="BadgeCheck" className="text-green-500" size={16} />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                    {user.bio && <p className="text-sm mt-1">{user.bio}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      Был(а) в сети {getTimeAgo(user.last_seen)}
                    </p>
                  </div>
                  <Button variant="outline">Посмотреть профиль</Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stories' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Истории</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gradient-primary text-white">
                    <Icon name="Plus" size={20} className="mr-2" />
                    Опубликовать
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Новая история</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Текст истории</Label>
                      <Textarea placeholder="Что у вас нового?" rows={4} />
                    </div>
                    <Button className="w-full gradient-primary text-white">Опубликовать</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {storiesWithUsers.map((story) => story.user && (
                <Card 
                  key={story.id} 
                  className="overflow-hidden cursor-pointer hover-scale"
                  onClick={() => setSelectedStory(story)}
                >
                  <div className="relative aspect-square gradient-accent flex items-center justify-center p-6">
                    <p className="text-white text-lg font-bold text-center line-clamp-6">{story.text}</p>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border-2 border-white">
                          <AvatarImage src={story.user.avatar_url} />
                        </Avatar>
                        <p className="text-white text-sm font-semibold">{story.user.username}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-white text-xs">
                        <Icon name="Eye" size={14} />
                        <span>{story.views} просмотров</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-bold">Уведомления</h2>
            <Card className="p-6 text-center text-muted-foreground">
              <Icon name="Bell" size={48} className="mx-auto mb-4 opacity-50" />
              <p>У вас пока нет уведомлений</p>
            </Card>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentUser.avatar_url} />
                  <AvatarFallback>{currentUser.display_name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{currentUser.display_name}</h2>
                    {currentUser.is_verified && (
                      <Icon name="BadgeCheck" className="text-green-500" size={24} />
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2">@{currentUser.username}</p>
                  <p className="mb-4">{currentUser.bio || 'Расскажите о себе...'}</p>
                  <div className="flex gap-3">
                    <Dialog open={editProfile} onOpenChange={setEditProfile}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Icon name="Edit" size={16} className="mr-2" />
                          Редактировать профиль
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Редактировать профиль</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Имя</Label>
                            <Input
                              value={profileForm.display_name}
                              onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Псевдоним</Label>
                            <Input
                              value={profileForm.username}
                              onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Описание</Label>
                            <Textarea
                              value={profileForm.bio}
                              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Аватар (URL)</Label>
                            <Input
                              value={profileForm.avatar_url}
                              onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                            />
                          </div>
                          <Button onClick={handleUpdateProfile} className="w-full gradient-primary text-white">
                            Сохранить изменения
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" onClick={() => {
                      setCurrentUser(null);
                      localStorage.removeItem('currentUser');
                    }}>
                      <Icon name="LogOut" size={16} className="mr-2" />
                      Выйти
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <div>
              <h3 className="text-xl font-bold mb-4">Мои истории</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {storiesWithUsers
                  .filter(s => s.user_id === currentUser.id)
                  .map((story) => (
                    <Card key={story.id} className="overflow-hidden group relative">
                      <div className="aspect-square gradient-primary flex items-center justify-center p-4">
                        <p className="text-white font-bold text-center line-clamp-6">{story.text}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="max-w-2xl">
          {selectedStory && selectedStory.user && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src={selectedStory.user.avatar_url} />
                  <AvatarFallback>{selectedStory.user.display_name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{selectedStory.user.display_name}</p>
                    {selectedStory.user.is_verified && (
                      <Icon name="BadgeCheck" className="text-green-500" size={16} />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{getTimeAgo(selectedStory.created_at)}</p>
                </div>
              </div>
              <div className="w-full aspect-video gradient-primary rounded-lg mb-4 flex items-center justify-center p-8">
                <p className="text-white text-3xl font-bold text-center">{selectedStory.text}</p>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon name="Eye" size={16} />
                <span className="text-sm">{selectedStory.views} просмотров</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}